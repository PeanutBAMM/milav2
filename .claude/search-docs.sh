#!/bin/bash
# Quick documentation search wrapper

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
QUERY="$*"

if [ -z "$QUERY" ]; then
    echo "Usage: ./search-docs.sh <search query>"
    echo "Examples:"
    echo "  ./search-docs.sh expense sharing"
    echo "  ./search-docs.sh tag:performance"
    echo "  ./search-docs.sh biometric auth"
    exit 1
fi

# Run the search
node "$SCRIPT_DIR/simple-rag.js" search "$QUERY"