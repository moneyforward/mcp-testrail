export interface TestRailConfig {
  url: string;
  username: string;
  apiKey: string;
  defaultProjectId?: number;
}

export interface TestRailProject {
  id: number;
  name: string;
  announcement?: string;
  show_announcement?: boolean;
  is_completed: boolean;
  completed_on?: number;
  suite_mode: number;
  url: string;
}

export interface TestRailSuite {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  is_master: boolean;
  is_baseline: boolean;
  is_completed: boolean;
  completed_on?: number;
  url: string;
}

export interface TestRailTestCase {
  id: number;
  title: string;
  section_id: number;
  template_id: number;
  type_id: number;
  priority_id: number;
  milestone_id?: number;
  refs?: string;
  created_by: number;
  created_on: number;
  updated_by: number;
  updated_on: number;
  estimate?: string;
  estimate_forecast?: string;
  suite_id: number;
  custom_steps_separated?: any[];
  custom_preconds?: string;
  custom_expected?: string;
  url: string;
}

export interface TestRailTestRun {
  id: number;
  suite_id: number;
  name: string;
  description?: string;
  milestone_id?: number;
  assignedto_id?: number;
  include_all: boolean;
  is_completed: boolean;
  completed_on?: number;
  passed_count: number;
  blocked_count: number;
  untested_count: number;
  retest_count: number;
  failed_count: number;
  custom_status1_count: number;
  custom_status2_count: number;
  custom_status3_count: number;
  custom_status4_count: number;
  custom_status5_count: number;
  custom_status6_count: number;
  custom_status7_count: number;
  project_id: number;
  plan_id?: number;
  created_on: number;
  created_by: number;
  url: string;
}

export interface TestRailTestResult {
  id: number;
  test_id: number;
  status_id: number;
  created_by: number;
  created_on: number;
  assignedto_id?: number;
  comment?: string;
  version?: string;
  elapsed?: string;
  defects?: string;
  custom_step_results?: any[];
}

export interface TestRailUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  role_id: number;
  role: string;
}

export interface TestRailMilestone {
  id: number;
  name: string;
  description?: string;
  start_on?: number;
  started_on?: number;
  due_on?: number;
  completed_on?: number;
  is_completed: boolean;
  is_started: boolean;
  project_id: number;
  parent_id?: number;
  url: string;
}

export interface TestRailSection {
  id: number;
  name: string;
  description?: string;
  suite_id: number;
  parent_id?: number;
  display_order: number;
  depth: number;
}