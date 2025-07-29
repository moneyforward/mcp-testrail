import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  TestRailConfig,
  TestRailProject,
  TestRailSuite,
  TestRailTestCase,
  TestRailTestRun,
  TestRailTestResult,
  TestRailUser,
  TestRailMilestone,
  TestRailSection,
} from './types.js';

export class TestRailClient {
  private api: AxiosInstance;
  private config: TestRailConfig;

  constructor(config: TestRailConfig) {
    this.config = config;
    
    // Create axios instance with basic auth
    this.api = axios.create({
      baseURL: `${config.url}/index.php?/api/v2`,
      auth: {
        username: config.username,
        password: config.apiKey,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Projects
  async getProjects(): Promise<TestRailProject[]> {
    const response: AxiosResponse<TestRailProject[]> = await this.api.get('/get_projects');
    return response.data;
  }

  async getProject(projectId: number): Promise<TestRailProject> {
    const response: AxiosResponse<TestRailProject> = await this.api.get(`/get_project/${projectId}`);
    return response.data;
  }

  // Suites
  async getSuites(projectId: number): Promise<TestRailSuite[]> {
    const response: AxiosResponse<TestRailSuite[]> = await this.api.get(`/get_suites/${projectId}`);
    return response.data;
  }

  async getSuite(suiteId: number): Promise<TestRailSuite> {
    const response: AxiosResponse<TestRailSuite> = await this.api.get(`/get_suite/${suiteId}`);
    return response.data;
  }

  // Sections
  async getSections(projectId: number, suiteId?: number): Promise<TestRailSection[]> {
    const url = suiteId 
      ? `/get_sections/${projectId}&suite_id=${suiteId}`
      : `/get_sections/${projectId}`;
    const response: AxiosResponse<TestRailSection[]> = await this.api.get(url);
    return response.data;
  }

  async getSection(sectionId: number): Promise<TestRailSection> {
    const response: AxiosResponse<TestRailSection> = await this.api.get(`/get_section/${sectionId}`);
    return response.data;
  }

  // Test Cases
  async getTestCases(projectId: number, suiteId?: number, sectionId?: number): Promise<TestRailTestCase[]> {
    let url = `/get_cases/${projectId}`;
    const params: string[] = [];
    
    if (suiteId) params.push(`suite_id=${suiteId}`);
    if (sectionId) params.push(`section_id=${sectionId}`);
    
    if (params.length > 0) {
      url += `&${params.join('&')}`;
    }
    
    const response: AxiosResponse<TestRailTestCase[]> = await this.api.get(url);
    return response.data;
  }

  async getTestCase(caseId: number): Promise<TestRailTestCase> {
    const response: AxiosResponse<TestRailTestCase> = await this.api.get(`/get_case/${caseId}`);
    return response.data;
  }

  async createTestCase(sectionId: number, data: Partial<TestRailTestCase>): Promise<TestRailTestCase> {
    const response: AxiosResponse<TestRailTestCase> = await this.api.post(`/add_case/${sectionId}`, data);
    return response.data;
  }

  async updateTestCase(caseId: number, data: Partial<TestRailTestCase>): Promise<TestRailTestCase> {
    const response: AxiosResponse<TestRailTestCase> = await this.api.post(`/update_case/${caseId}`, data);
    return response.data;
  }

  // Test Runs
  async getTestRuns(projectId: number): Promise<TestRailTestRun[]> {
    const response: AxiosResponse<TestRailTestRun[]> = await this.api.get(`/get_runs/${projectId}`);
    return response.data;
  }

  async getTestRun(runId: number): Promise<TestRailTestRun> {
    const response: AxiosResponse<TestRailTestRun> = await this.api.get(`/get_run/${runId}`);
    return response.data;
  }

  async createTestRun(projectId: number, data: Partial<TestRailTestRun>): Promise<TestRailTestRun> {
    const response: AxiosResponse<TestRailTestRun> = await this.api.post(`/add_run/${projectId}`, data);
    return response.data;
  }

  async closeTestRun(runId: number): Promise<TestRailTestRun> {
    const response: AxiosResponse<TestRailTestRun> = await this.api.post(`/close_run/${runId}`);
    return response.data;
  }

  // Test Results
  async getTestResults(testId: number): Promise<TestRailTestResult[]> {
    const response: AxiosResponse<TestRailTestResult[]> = await this.api.get(`/get_results/${testId}`);
    return response.data;
  }

  async addTestResult(testId: number, data: Partial<TestRailTestResult>): Promise<TestRailTestResult> {
    const response: AxiosResponse<TestRailTestResult> = await this.api.post(`/add_result/${testId}`, data);
    return response.data;
  }

  async addTestResultForCase(runId: number, caseId: number, data: Partial<TestRailTestResult>): Promise<TestRailTestResult> {
    const response: AxiosResponse<TestRailTestResult> = await this.api.post(`/add_result_for_case/${runId}/${caseId}`, data);
    return response.data;
  }

  // Users
  async getUsers(): Promise<TestRailUser[]> {
    const response: AxiosResponse<TestRailUser[]> = await this.api.get('/get_users');
    return response.data;
  }

  async getUser(userId: number): Promise<TestRailUser> {
    const response: AxiosResponse<TestRailUser> = await this.api.get(`/get_user/${userId}`);
    return response.data;
  }

  // Milestones
  async getMilestones(projectId: number): Promise<TestRailMilestone[]> {
    const response: AxiosResponse<TestRailMilestone[]> = await this.api.get(`/get_milestones/${projectId}`);
    return response.data;
  }

  async getMilestone(milestoneId: number): Promise<TestRailMilestone> {
    const response: AxiosResponse<TestRailMilestone> = await this.api.get(`/get_milestone/${milestoneId}`);
    return response.data;
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.getProjects();
      return true;
    } catch (error) {
      return false;
    }
  }

  getDefaultProjectId(): number | undefined {
    return this.config.defaultProjectId;
  }
} 