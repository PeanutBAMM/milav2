export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Lists: undefined;
  Expenses: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeOverview: undefined;
  CreateFamily: undefined;
  JoinFamily: undefined;
  FamilyDetails: { familyId: string };
  FamilySettings: { familyId: string };
};

export type ListsStackParamList = {
  ListsOverview: undefined;
  ListDetail: { listId: string };
  CreateList: undefined;
};
