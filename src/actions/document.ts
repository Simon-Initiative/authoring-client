
export module document 
{  
  export type VIEW_DOCUMENT = 'VIEW_DOCUMENT';
  export const VIEW_DOCUMENT : VIEW_DOCUMENT = 'VIEW_DOCUMENT';

  export type VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';
  export const VIEW_ALL_COURSES : VIEW_ALL_COURSES = 'VIEW_ALL_COURSES';
  
  var menuCollapsed:Boolean=false;
  var menuWidth:Number=-1;
  
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

  export function viewAllCourses() : viewAllCoursesAction {
    return {
      type: VIEW_ALL_COURSES
    }
  }

	/**
	*
	*/  
  	export function collapseMenu ()
  	{
  		if (menuWidth==-1)
  		{
  			//menuWidth=document.getElementById("sidebarmenu").offsetWidth;
  		}
  	
  		if (menuCollapsed==false)
  		{
  			menuCollapsed=true;
  			//document.getElementById("sidebarmenucontent").style.visibility='hidden';
  			//document.getElementById("sidebarmenu").offsetWidth='75px';
  		}
  		else
  		{
  			menuCollapsed=false;
  			//document.getElementById("sidebarmenucontent").style.visibility='visible';
  			//document.getElementById("sidebarmenu").offsetWidth=menuWidth;
  		}	
  	}
  	
  	/**
  	*
  	*/
  	export function viewOutlineEditor ()
  	{
  	
  	}  	
}
