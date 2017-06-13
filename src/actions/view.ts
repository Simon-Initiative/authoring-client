import history from '../utils/history';

export function viewCreateCourse(): void {
  history.push('/create');
}

export function viewDocument(documentId: string): void {
  history.push('/' + documentId);
}

export function viewSkills() : void {
  history.push('/skills');
}

export function viewPages() : void {
  history.push('/pages');
}

export function viewAssessments() : void {
  history.push('/assessments');
}

export function viewOrganizations() : void {
  history.push('/organizations');
}

export function viewObjectives() : void {
  history.push('/objectives');
}

export function viewPools() : void {
  history.push('/pools');
}

export function viewAllCourses(): void {
  history.push('/');
}
