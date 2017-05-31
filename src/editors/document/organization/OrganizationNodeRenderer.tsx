import * as React from 'react';
import { Component, PropTypes } from 'react';

import { isDescendant } from 'react-sortable-tree';
import Modal from 'react-modal';
import * as contentTypes from '../../../data/contentTypes';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { AppServices } from '../../common/AppServices';
import {OrgContentTypes, IDRef, OrgItem, OrgSection, OrgModule, OrgSequence, OrgOrganization} from '../../../data/org';
//import DropdownMenu from 'react-dd-menu';

import '../../../stylesheets/sortabletree.scss';
//import '../../../stylesheets/sortabletree.scss';

const styles = {
    
  orgrowWrapper : {
    "padding": "10px 10px 10px 0",
    "height": "100%",
    "boxSizing": "border-box"
  },
  orgrow : {
    "border" : '0px solid green',  
    "height": "100%",
    "flexDirection" : "row",  
    "display": "flex",    
    "justifyContent": "space-between",
    "background": "#ffffff",  
  },     
  orgrowLandingPad : {
    "border": "none !important",
    "boxShadow": "none !important",
    "outline": "none !important",
    "*" : {
      "opacity": "0 !important"
    },
    "&::before" : {
        "backgroundColor": "lightblue",
        "border": "3px dashed white",
        "content": "",
        "position": "absolute",
        "top": "0",
        "right": "0",
        "bottom": "0",
        "left": "0",
        "zIndex": -1
    }    
  },
  orgrowCancelPad : {
    "border": "none !important",
    "boxShadow": "none !important",
    "outline": "none !important",
    "*" : {
      "opacity": "0 !important"
    },
    "&::before" : {
        "backgroundColor": "#E6A8AD",
        "border": "3px dashed white",
        "content": "",
        "position": "absolute",
        "top": "0",
        "right": "0",
        "bottom": "0",
        "left": "0",
        "zIndex": -1
    }
  },
  orgrowSearchMatch : {
    "outline": "solid 3px #0080ff"
  },
  orgrowSearchFocus : {
    "outline": "solid 3px #fc6421"
  },
  orgrowItem : {
    "display": "inline-block",
    "verticalAlign": "middle"
  },
  orgrowContents : {          
    "position": "relative",
    "height": "100%",
    "border": "solid #bbb 0px",
    "borderLeft": "none",
    "boxShadow": "0 2px 2px -2px",
    "padding": "0 5px 0 10px",
    "borderRadius": "2px",
    "minWidth": "230px",
    //"maxWidth": "500px",
    "alignItems": "left",
    "verticalAlign": "middle",
    "backgroundColor": "white"
  },
  orgrowContentsDragDisabled : {
    "borderLeft": "solid #bbb 1px"
  },
  orgmoveHandle : {
    //@extend %orgrowItem;
    "display": "inline-block",
    "verticalAlign": "middle",
          
    "height": "100%",
    "width": "44px",
    "background": "#d9d9d9 url('data:image/svg+xml;base64,phn2zyb4bwxucz0iahr0cdovl3d3dy53my5vcmcvmjawmc9zdmciihdpzhropsi0miigagvpz2h0psi0mii+pgcgc3ryb2tlpsijrkzgiibzdhjva2utd2lkdgg9ijiuosigpjxwyxroigq9ik0xncaxns43ade0ljqilz48cgf0acbkpsjnmtqgmjeunggxnc40ii8+phbhdgggzd0itte0idi3ljfomtquncivpjwvzz4kpc9zdmc+') no-repeat center",
    "border": "solid #aaa 1px",
    "boxShadow": "0 2px 2px -2px",
    "cursor": "move",
    "borderRadius": "1px",
    "zIndex": 1,
  },
  backupHamburger : {
    "margin" : "auto",
    "width" : "16px",
    "height" : "16px",
    "backgroundSize" : "44px 44px",
    "background": "#ffffff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAA4klEQVR4nGP8//8/AymAiSTVDAwMLJt37i+rqvn7n4GRkRGPuv///zMyMvS0tTDqWLuIioqzs7MTNPvnzx8f379jiggLZ2VnZWJhIohYOFiDgoIZ/5Pia0YGBhYIRTxg2bL7YFl17f//BDX+Z2Jg6GxrZjSw95SQlGLj5CRo9q9v39+9ecUUHhrKysHOysRMELGxs/sHBzL+IzGmWUjyMQMDA8uW3YcqGpqIVN3RUMdo5hYgLS/PzsnNhDeU/jH8//nt26tnTxi7Ziw6f/EaMyc7/mT4j4Hh7/efhvrajKQmbwBQa0jTnL7HxQAAAABJRU5ErkJggg==') no-repeat center",
  },  
  wpage: {
    "margin" : "auto",
    "width" : "16px",
    "height" : "16px",
    "backgroundSize" : "44px 44px",
    "background": "#ffffff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAKMSURBVDhPXVNLT1NREP7u7e0LAwrdeLFRm1RdkKgLqUseCV3ZB60JbixoIIGwlLUJj59RIcACcaOCLCCGda3ijpg0lTRtMFFopTxa+qDHM9PemvBtZua7M3PO+WauIiTmZmfw+88BVFWFDKEoCgiGf5kjXG1rxczsHJSpqVfCopnxenoax/k8rFYrKpWKLFChaSacn5/DZrOhWq1yoaZpUOW3+fk32Pm+A4yNjcqmQsiEpr24uGBfFrOl+DJHGI48F6pm0nB6egaTycQnkKWnFAoFvg2BTieOYHDlcqWeS4HNakH++BhtrVfg6GhHNBpFS0sLJicnMBgMwGKxYHt7Gw5HB+w2K1KplOTM3AgT4+Pi5OSEr7S1uSk83Y/YJzx8cF/cvnWzEQkxMhwRCwsL7JdKZfHyxYhQBQQLQxjwehH/+o19ulHh7AwulwvJZJK59bU1eL0DqNVqMJvrNWp9OECpVGLraL+GRCKBT+trCIef4onPh7crK/wt+/cInZ03muOmgbIGJJIhji8QwOetLbxbXcVgOAS/P4CPH94jHo+jr7eHcyhfTgV0uGygyOuYmSAEg0FsbGxgb+8nurs9cLvdODg8xPLyEkKhMOfQUlGNkFY2ELw4Bjyex/gSj+HO3XsNBujp7cWqfEZffz/HNL5yqQy5xpAi1reLyGKxCF3Xkcsd8U0MhOXJB9kcurq6OCa9NDnGpgYEIu12O4uzv/8LkcgwNyT4/H5kMhn2mwvW+Ce4AalKpCGO3qk3G9LzaGxOp5Mb0oJRrMgaGqFalQmxWIy70VOMnTCmQmIZa04NCXTgj91dfqqSy2bF0LMh6Nd1qS5JakDOWSjM/Yf8KjnVpCKdTmNxcQn/AC+cYPqO5VjgAAAAAElFTkSuQmCC') no-repeat center",      
  },
  apage: {
    "margin" : "auto",
    "width" : "16px",
    "height" : "16px",
    "backgroundSize" : "44px 44px",
    "background": "#ffffff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAEOSURBVDhPrZOxjYUwDIZ/rqCmRdCxAHSA6GECBDuwBAUbwAJ0bABbsAMUjIBE8e7ZlzxCDj2d9O6TrMR2Yjm/HOPxBB9wW2BdV7Rti3me2fd9H1VVwXVd9i9QAZUoiqjgrVFO59KBYRhi9x7lCr7EijiOxe6kaRrUdS28k8tZ6mBZlkur0iR3ObpDcAckmE6SJNj3ndsNw1BET7qu45U1yLIM0zRxQDIMA7Ztg2masCwLZVmKzA9pmmIcx1MDnTzP4TgObNtGURQieiIF5wJBELAj8TyP1+M4+BmEjEloNhh6gi5i3/cUfvkExdQzUsSX1O8GSDd1oP5vkAhKPKsL7zeUUy8TH3+m2wJ/B/gGDaPth4EM8IcAAAAASUVORK5CYII=') no-repeat center",      
  },  
  orgloadingHandle : {
    "height": "42px",
    "width": "45px",
    "border": "0px solid green",
    "borderRadius": "1px",
    "zIndex": 1,                  
    "cursor": "pointer",
    "background": "#ffffff",
    "verticalAlign" : "middle",
    "textAlign": "center",  
    "display": "flex",
    "alignItems": "center" 
  },
  orgpageHandle : {
    "height": "42px",
    "width": "45px",
    "border": "0px solid green",
    "borderRadius": "1px",
    "zIndex": 1,                  
    "background": "#ffffff",
    "verticalAlign" : "middle",
    "textAlign": "center",  
    "display": "flex",
    "alignItems": "center" 
  },  
  orgloadingCircle : {
    "width": "80%",
    "height": "80%",
    "margin": "10%",
    "position": "relative",
    "border" : "1px solid green"
  },
  orgloadingCirclePoint : {
    "width": "100%",
    "height": "100%",
    "position": "absolute",
    "left": "0",
    "top": "0",
    
    "border" : "1px solid blue",
    
    "pointcount": "12",
    "spinAnimationTime": "800ms",

    "&:before" : {
        "content": '',
        "display": "block",
        "margin": "0 auto",
        "width": "11%",
        "height": "30%",        
        "backgroundColor": "#FFF",
        "borderRadius" : "30%",
        "animation": "pointFade 800ms infinite ease-in-out both"
    },

    "@for $i from 1 through (($point-count + 1) / 2)" : {
        "&:nth-of-type(#{$i})" : {
            "transform": "rotate(360deg / $point-count * ($i - 1))"
        },

        "&:nth-of-type(#{$i + $point-count / 2})" : {
            "transform": "rotate(180deg + 360deg / $point-count * ($i - 1))"
        },

        "&:nth-of-type(#{$i}), &:nth-of-type(#{$i + $point-count / 2})" : {
            "&:before" : {
                "animationDelay" : "- $spin-animation-time + ($spin-animation-time / $point-count * 2 * ($i - 1))"
            }
        }
    }    
  },
  orgtoolbarButton : {
    //@extend %orgrowItem;
    "display": "inline-block",
    "verticalAlign": "middle",          
  },
  orgrowTitle : {    
    "border": "0px solid red",
    "display": "inline-block",
    "width": "inherited",
    "height": "100%",    
    "overflowY": "hidden",
    "overflowX": "hidden",
    "marginRight": "auto", 
    "fontFamily" : "'Roboto Slab', serif",
    "verticalAlign": "middle",
    "lineHeight": "42px"
  },
  orgrowControl : {    
    "border": "1px solid red",
    "width": "26px",
    "height": "42px",    
    "overflowY": "hidden",
    "overflowX": "hidden", 
    "fontFamily" : "'Roboto Slab', serif",
    "verticalAlign": "middle",
    "lineHeight": "42px"
  },  
  orgrowTitleWithSubtitle : {
    "fontSize": "85%",
    "display": "block",
    "height": "0.8rem"
  },
  orgrowSubtitle : {
    "fontSize": "70%",
    "lineHeight": "1"
  },
  orgcollapseButton : {
    "appearance": "none",
    "border": "none",
    "position": "absolute",
    "borderRadius": "100%",
    "boxShadow": "0 0 0 1px #000",
    "width": "16px",
    "height": "16px",
    "top": "50%",
    "transform": "translate(-50%, -50%)",
    "cursor": "pointer",
    "background": "#fff url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjgiIGZpbGw9IiNGRkYiLz48ZyBzdHJva2U9IiM5ODk4OTgiIHN0cm9rZS13aWR0aD0iMS45IiA+PHBhdGggZD0iTTQuNSA5aDkiLz48L2c+Cjwvc3ZnPg==') no-repeat center",
    
    "&:focus" : {
        "outline": "none",
        "boxShadow": "0 0 0 1px #000, 0 0 1px 3px #83BEF9"
    },

    "&:hover:not(:active)" : {
        "backgroundSize" : "24px",
        "height": "20px",
        "width": "20px"
    }
  },
  orgexpandButton : {
    "appearance": "none",
    "border": "none",
    "position": "absolute",
    "borderRadius": "100%",
    "boxShadow": "0 0 0 1px #000",
    "width": "16px",
    "height": "16px",
    "top": "50%",
    "transform": "translate(-50%, -50%)",
    "cursor": "pointer",
    "background": "#fff url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjgiIGZpbGw9IiNGRkYiLz48ZyBzdHJva2U9IiM5ODk4OTgiIHN0cm9rZS13aWR0aD0iMS45IiA+PHBhdGggZD0iTTQuNSA5aDkiLz48cGF0aCBkPSJNOSA0LjV2OSIvPjwvZz4KPC9zdmc+') no-repeat center",
    
    "&:focus" : {
        "outline": "none",
        "boxShadow": "0 0 0 1px #000, 0 0 1px 3px #83BEF9"
    },

    "&:hover:not(:active)" : {
        "backgroundSize" : "24px",
        "height": "20px",
        "width": "20px"
    }    
  },
  orglineChildren : {
    "height": "100%",
    "display": "inline-block",
    "position": "absolute",
    
    "&::after" : {
        "content": "",
        "position": "absolute",
        "backgroundColor": "black",
        "width": "1px",
        "left": "50%",
        "bottom": "0",
        "height": "10px"
    }    
  },
  titleContainer: {
    "display" : "flex", 
    "flexDirection" : 'column',
    "justifyContent": "space-between",
    'padding': '0px'
  },
  titleDivider : {
    'border' : '0px solid red',
    "overflowY": "hidden",
    "overflowX": "hidden",
    "minWidth": "370px",      
    "maxWidth": "370px",
    'height': '14px',
    'line-height': '14px',
    'margin': '0px',
    'padding': '0px',
    'font-size': '10px'
  },
  loTitleRenderer : {
    'border' : '0px solid black',
    "overflowY": "hidden",
    "overflowX": "hidden",      
    "minWidth": "370px",      
    "maxWidth": "370px",
    'height': '26px',
    'line-height': '26px',
    'margin-top': '0px',
    'margin-bottom': '2px'
  }, 
  popupAddedStyle : {
    "zIndex": -1,
    "border": "1px solid red"
  }
};

/**
 * 
 */
class OrganizationNodeRenderer extends Component <any,any>
{
    deleteNodeFunction:any=null;
    editNodeTitle:any=null;
    linkAnnotation:any=null;
    addPage:any=null;
    addActivity:any=null;
    addModule:any=null;
    addSection:any=null;
    
    constructor() {
      super ();  
      this.state = {
        isMenuOpen: false
      };
    }    
    
    popupToggle (e) : void {
      console.log ("popup ()");
        
      if (this.state.isMenuOpen==true) {
        this.setState ({isMenuOpen: false});    
      }
      else {
        this.setState ({isMenuOpen: true});
      }  
    }
    
    popupClose (e) : void {
      console.log ("popupClose ()");
        
      this.setState ({isMenuOpen: false});  
    }    
    
    /**
     * 
     */
    generatePopDown (node) {         
      let bStyle:any=styles.orgrowTitle;
      bStyle ["marginLeft"]="10px";
        
      const chevron=<div><a style={bStyle} href="#" onClick={(e) => this.popupToggle (e)}><i className="fa fa-chevron-down"></i>&nbsp;</a></div>;  
        
      if (this.state.isMenuOpen==false)
      {
          return (<div><a style={bStyle} href="#" onClick={(e) => this.popupToggle (e)}><i className="fa fa-chevron-down"></i>&nbsp;</a></div>);
      }  
        
      let menuStyle:string="flex-column onclick-menu-content list-group";
        
      let loLink=<li className="list-group-item"><a href="#" onClick={(e) => this.linkAnnotation (node)}>Learning Objective</a></li>;
      let pageLink=<li className="list-group-item">Page</li>;
      let activityLink=<li className="list-group-item">Activity</li>;
      let assetLink=<li className="list-group-item"><a href="#" >Add-On</a></li>;
      let sectionLink;
      let moduleLink;
        
      if (node.orgType==OrgContentTypes.Module) {
        sectionLink=<li className="list-group-item"><a href="#" onClick={(e) => this.addSection (node)}>Section</a></li>
      }

      if (node.orgType==OrgContentTypes.Sequence) {
        moduleLink=<li className="list-group-item"><a href="#" onClick={(e) => this.addModule (node)}>Module</a></li>
      }

      if (node.orgType==OrgContentTypes.Section) {
        pageLink=<li className="list-group-item"><a href="#" onClick={(e) => this.addPage (node)}>Page</a></li>;
        activityLink=<li className="list-group-item"><a href="#" onClick={(e) => this.addActivity (node)}>Activity</a></li>
      }
                 
      return (
            <div><a style={bStyle} href="#" onClick={(e) => this.popupToggle (e)}><i className="fa fa-chevron-down"></i>&nbsp;</a>
            <div tabIndex={0} className="onclick-menu">
              <ul className={menuStyle}>
                Content
                {moduleLink}
                {sectionLink}
                <li className="list-group-item"><a href="#" onClick={(e) => this.deleteNodeFunction (node)}>Delete</a></li>
                {loLink}
                {pageLink}
                {activityLink}
                Assets
                {assetLink}
              </ul>
            </div>
            </div>);
    }

    render() {        
        //console.log ("render ()");
        
        var {
            editNodeTitle,
            addPage,
            deleteNode,
            treeData,
            linkAnnotation,
            addActivity,  
            addModule,
            addSection,
            scaffoldBlockPxWidth,
            toggleChildrenVisibility,
            connectDragPreview,
            connectDragSource,
            isDragging,
            canDrop,
            canDrag,
            node,
            draggedNode,
            path,
            treeIndex,
            isSearchMatch,
            isSearchFocus,
            buttons,
            className,
            style = {},
            didDrop,
            isOver,
            parentNode: _parentNode, // Needed for drag-and-drop utils
            endDrag:    _endDrag,    // Needed for drag-and-drop utils
            startDrag:  _startDrag,  // Needed for drag-and-drop utils
            ...otherProps,
        } = this.props;

        //console.log ("Rendering node: " + JSON.stringify (node));

        let handle;

        this.linkAnnotation=linkAnnotation;
        this.editNodeTitle=editNodeTitle;        
        this.deleteNodeFunction=deleteNode;
        this.addPage=addPage;
        this.addActivity=addActivity;
        this.addModule=addModule;
        this.addSection=addSection;

        // Currently a safety feature to make sure we can't drag workbook pages
        // to different levels but only keep them as leaf nodes.
        if (node.orgType!=OrgContentTypes.Item) {
         canDrag=true;
        }    
        
        let hStyle:any=styles.backupHamburger;
        let workbookPageStyle:any=styles.wpage;
        let activityPageStyle:any=styles.apage;

        if (node.orgType!=OrgContentTypes.Item) {
          handle = connectDragSource((
            <div style={styles.orgloadingHandle}>
              <div id="handle" style={hStyle}></div>
            </div>
          ), { dropEffect: 'copy' });
        } else {
          if (node.typeDescription=="x-oli-workbook_page") {  
            handle = <div style={styles.orgpageHandle}><div id="handle" style={workbookPageStyle}></div></div>;
          }
            
          if ((node.typeDescription=="x-oli-inline-assessment") || (node.typeDescription=="x-oli-assessment2")){  
            handle = <div style={styles.orgpageHandle}><div id="handle" style={activityPageStyle}></div></div>;
          }            
        }    

        const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
        const isLandingPadActive  = !didDrop && isDragging;

        //>--------------------------------------------------------------------

        let handleStyle:any=styles.orgcollapseButton;
        styles.orgcollapseButton ["left"]= -0.5 * scaffoldBlockPxWidth;
        styles.orgexpandButton ["left"]= -0.5 * scaffoldBlockPxWidth;

        if (node.expanded==true) {            
            handleStyle=styles.orgcollapseButton;
        }    
        else {
            handleStyle=styles.orgexpandButton;
        }

        //>--------------------------------------------------------------------

        let nStyle:any=styles.orglineChildren;
        nStyle ["width"]=scaffoldBlockPxWidth;

        //>--------------------------------------------------------------------

        let gStyle:any=styles.orgrow;

        if (isDragging && isOver) {
          gStyle ["border"]= "none !important";
          gStyle ["boxShadow"]= "none !important";
          gStyle ["outline"]= "none !important";
          gStyle ["*" ]= {
            "opacity": "0 !important"
          };
          gStyle ["&::before" ]= {
            "backgroundColor": "lightblue",
            "border": "3px dashed white",
            "content": "",
            "position": "absolute",
            "top": "0",
            "right": "0",
            "bottom": "0",
            "left": "0",
            "zIndex": -1
          };           
        }

        if (isDragging && !isOver && canDrop) {
          gStyle ["border"]= "none !important";
          gStyle ["boxShadow"]= "none !important";
          gStyle ["outline"]= "none !important";
          gStyle ["*"]= {
            "opacity": "0 !important"
          };
          gStyle ["&::before"]= {
            "backgroundColor": "#E6A8AD",
            "border": "3px dashed white",
            "content": "",
            "position": "absolute",
            "top": "0",
            "right": "0",
            "bottom": "0",
            "left": "0",
            "zIndex": -1
          };
        }

        if (isSearchMatch) {
          gStyle ["outline"]="solid 3px #0080ff"
        }

        if (isSearchFocus) {
          gStyle ["outline"]="solid 3px #fc6421"
        }

        gStyle ["opacity"]=isDraggedDescendant ? 0.5 : 1;

        //>--------------------------------------------------------------------

        let dStyle:any=styles.orgrowContents;

        if (canDrag==false) {
            dStyle ["borderLeft"]="solid #BBB 1px"; // Move this to outside the render code ASAP
        }

        //>--------------------------------------------------------------------

        let iStyle:any=styles.orgrowTitle;

        if (node.subtitle) {
            iStyle ["fontSize"]="85%";
            iStyle ["display"]="block";
            iStyle ["height"]="0.8rem";
        }

        // If we assign the style directly then React freaks out (or TypeScript it's hard to tell)
        // and claims that 'bold' isn't a valid option for fontWeight
        let tStyle:any=styles.orgrowTitle;

        let bStyle:any=styles.orgrowTitle;
        bStyle ["marginLeft"]="10px";
        bStyle ["textDecoration"]="none";
 
        let titleDivider:any=styles.titleDivider;
        let titleContainer:any=styles.titleContainer;

        //>--------------------------------------------------------------------

        var titleObj=new contentTypes.Title({ text: node.title})
        const services = ({} as AppServices);
        const context = { userId: null, documentId: null, courseId: null, baseUrl: null};

        //>--------------------------------------------------------------------

        let popDown=this.generatePopDown (node);

        return (
            <div style={{ height: '100%', width: '450px' }} {...otherProps}>
                {toggleChildrenVisibility && node.children && node.children.length > 0 && (
                    <div>
                        <button
                            type="button"                            
                            style={handleStyle}
                            onClick={() => toggleChildrenVisibility({node, path, treeIndex})}
                        />
                    
                        { node.expanded && !isDragging &&  <div style={nStyle} /> }
                    </div>
                )}

                <div style={styles.orgrowWrapper as any}>
                    {/* Set the row preview to be used during drag and drop */}
                    {connectDragPreview(
                        <div style={gStyle}>
                          {handle}
                           <div style={titleContainer}>
                             <TitleContentEditor 
                               services={services}
                               editMode={true}
                               model={titleObj}
                               context={context}
                               styles={styles.loTitleRenderer}
                               onEdit={(content) => this.editNodeTitle(node,content)} 
                             />
                             <div style={titleDivider}>
                             {node.orgType}
                             </div>                             
                           </div>
            
                           {popDown}
                               
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default OrganizationNodeRenderer;
 
