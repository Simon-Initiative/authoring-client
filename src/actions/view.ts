import history from '../utils/history';

export function viewCreateCourse(): void {
  history.push('/create');
}

export function viewDocument(documentId: string, courseId: string): void {
  history.push('/' + documentId + '-' + courseId);
}

export function viewSkills(courseId: string) : void {
  history.push('/skills-' + courseId);
}

export function viewPages(courseId: string) : void {
  history.push('/pages-' + courseId);
}

export function viewAssessments(courseId: string) : void {
  history.push('/assessments-' + courseId);
}

export function viewOrganizations(courseId: string) : void {
  history.push('/organizations-' + courseId);
}

export function viewObjectives(courseId: string) : void {
  history.push('/objectives-' + courseId);
}

export function viewPools(courseId: string) : void {
  history.push('/pools-' + courseId);
}

export function viewAllCourses(): void {
  history.push('/');
}
