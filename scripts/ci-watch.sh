#!/bin/bash

# CI Watcher Script - Automatically monitors CI after push
# Used by Claude during coding sessions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 CI Monitor Started${NC}"
echo "================================"

# Get the latest run ID
echo -e "${YELLOW}Finding latest CI run...${NC}"
RUN_ID=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')

if [ -z "$RUN_ID" ]; then
    echo -e "${RED}❌ No CI runs found${NC}"
    exit 1
fi

echo -e "Monitoring run: #$RUN_ID"

# Wait for CI to complete
STATUS="in_progress"
DOTS=""
while [ "$STATUS" = "in_progress" ] || [ "$STATUS" = "queued" ]; do
    sleep 3
    STATUS=$(gh run view $RUN_ID --json status -q '.status' 2>/dev/null || echo "in_progress")
    DOTS="${DOTS}."
    echo -ne "\r${YELLOW}Waiting for CI to complete${DOTS}${NC}"
done

echo -e "\n"

# Get the conclusion
CONCLUSION=$(gh run view $RUN_ID --json conclusion -q '.conclusion')
WORKFLOW=$(gh run view $RUN_ID --json name -q '.name')

echo -e "${BLUE}Workflow:${NC} $WORKFLOW"
echo -e "${BLUE}Status:${NC} $STATUS"

if [ "$CONCLUSION" = "success" ]; then
    echo -e "${GREEN}✅ All CI checks passed!${NC}"
    
    # Show summary of what passed
    echo -e "\n${GREEN}Passed checks:${NC}"
    gh run view $RUN_ID | grep "✓" | head -10
    
else
    echo -e "${RED}❌ CI Failed or has warnings!${NC}"
    echo -e "${RED}Conclusion: $CONCLUSION${NC}"
    
    # Create temporary file for logs
    LOG_FILE="/tmp/ci-failure-$(date +%s).log"
    
    echo -e "\n${YELLOW}📥 Fetching detailed logs...${NC}"
    gh run view $RUN_ID --log-failed > "$LOG_FILE" 2>&1
    
    # Extract and display key errors
    echo -e "\n${RED}=== ERROR SUMMARY ===${NC}"
    
    # TypeScript errors
    TS_ERRORS=$(grep -E "error TS[0-9]+:" "$LOG_FILE" | head -5)
    if [ ! -z "$TS_ERRORS" ]; then
        echo -e "\n${RED}TypeScript Errors:${NC}"
        echo "$TS_ERRORS"
    fi
    
    # ESLint errors
    ESLINT_ERRORS=$(grep -E "[0-9]+:[0-9]+\s+error" "$LOG_FILE" | head -5)
    if [ ! -z "$ESLINT_ERRORS" ]; then
        echo -e "\n${RED}ESLint Errors:${NC}"
        echo "$ESLINT_ERRORS"
    fi
    
    # Expo doctor issues
    EXPO_ISSUES=$(grep -A5 "expo-doctor" "$LOG_FILE" | grep -E "(Warning|Error)" | head -5)
    if [ ! -z "$EXPO_ISSUES" ]; then
        echo -e "\n${RED}Expo Doctor Issues:${NC}"
        echo "$EXPO_ISSUES"
    fi
    
    # Console.log detection
    CONSOLE_LOGS=$(grep -A2 "Found console.log" "$LOG_FILE")
    if [ ! -z "$CONSOLE_LOGS" ]; then
        echo -e "\n${RED}Console.log found:${NC}"
        echo "$CONSOLE_LOGS"
    fi
    
    # Tech stack compliance
    COMPLIANCE=$(grep -A10 "Tech Stack Compliance" "$LOG_FILE" | grep "❌" | head -5)
    if [ ! -z "$COMPLIANCE" ]; then
        echo -e "\n${RED}Tech Stack Compliance Issues:${NC}"
        echo "$COMPLIANCE"
    fi
    
    echo -e "\n${YELLOW}Full logs saved to: $LOG_FILE${NC}"
    echo -e "${YELLOW}View on GitHub: https://github.com/PeanutBAMM/milav2/actions/runs/$RUN_ID${NC}"
    
    # Attempt self-healing
    echo -e "\n${BLUE}🔧 Attempting automatic fixes...${NC}"
    echo "================================"
    
    # Run self-healing script
    if node "$(dirname "$0")/ci-self-heal.js" "$LOG_FILE"; then
        echo -e "\n${GREEN}✅ Automatic fixes applied!${NC}"
        echo -e "${YELLOW}Re-running CI to verify fixes...${NC}"
        
        # Push the fixes
        git push
        
        # Start monitoring the new CI run
        echo -e "\n${BLUE}Monitoring new CI run after fixes...${NC}"
        exec "$0"  # Re-run this script
    else
        echo -e "\n${RED}❌ Could not automatically fix all issues${NC}"
        echo -e "${YELLOW}Manual intervention required${NC}"
        
        # Suggest manual fixes based on error type
        if [ ! -z "$TS_ERRORS" ]; then
            echo -e "\n${YELLOW}TypeScript fixes needed:${NC}"
            echo "- Check type definitions"
            echo "- Add missing type annotations"
            echo "- Fix type mismatches"
        fi
        
        if [ ! -z "$CONSOLE_LOGS" ]; then
            echo -e "\n${YELLOW}Console.log cleanup needed:${NC}"
            echo "- Remove debug console.log statements"
            echo "- Keep only console.error/warn for production"
        fi
        
        # Return error code for CI failure
        exit 1
    fi
fi