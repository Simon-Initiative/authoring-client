
export module document 
{  
  	export type VIEW_DOCUMENT = 'VIEW_DOCUMENT';
  	export const VIEW_DOCUMENT : VIEW_DOCUMENT = 'VIEW_DOCUMENT';

  	export type VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';
  	export const VIEW_ALL_COURSES : VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';
  	
  	export type VIEW_ORGANIZATION = 'VIEW_ORGANIZATION';
  	export const VIEW_ORGANIZATION : VIEW_ORGANIZATION = 'VIEW_ORGANIZATION';  	
    
  	export type viewDocumentAction = {
    	type: VIEW_DOCUMENT,
    	documentId: string
  	}

  	export function viewDocument(documentId: string) : viewDocumentAction {
    	return {
      			type: VIEW_DOCUMENT,
      			documentId
    	}
  	}

  	export type viewAllCoursesAction = {
    	type: VIEW_ALL_COURSES
  	}
  	
	
  	export type viewCourseOrganizationAction = {
    	type: VIEW_ORGANIZATION
  	}

	/**
	*
	*/
  	export function viewAllCourses() : viewAllCoursesAction 
  	{  
	  	console.log ("viewAllCourses()");
    	return {
      		type: VIEW_ALL_COURSES
    	}
  	}
  	
  	/**
  	*
  	*/
  	export function viewOutlineEditor () : viewCourseOrganizationAction 
  	{
		console.log ("viewOutlineEditor()");
		return {
      		type: VIEW_ORGANIZATION
    	}
  	}  	
}
