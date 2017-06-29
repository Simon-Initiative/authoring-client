import * as React from 'react';
import { Component, PropTypes } from 'react';

import { isDescendant } from 'react-sortable-tree';
import Modal from 'react-modal';

import * as contentTypes from '../../../data/contentTypes';
import { TitleContentEditor } from '../../content/title/TitleContentEditor';
import { AppServices } from '../../common/AppServices';

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
  loTitleRenderer : {
      'border' : '0px solid black',
      "overflowY": "hidden",
      "overflowX": "hidden",
      "minWidth": "350px",      
      "maxWidth": "350px",
      'height': '42px',
      'lineHeight': '42px',
      'margin': '0px'
  },
  numberStyle: { 
    'marginLeft' : '4px',
    'marginTop' : '8px',  
    'border-radius': '50%',    
    'width': '26px',
    'height': '24px',
    'padding': '4px',
    'background': '#fff',
    'border': '2px solid #666',
    'color': '#666',
    'text-align': 'center',
    'font': '12px Arial, sans-serif'
  },  
};

/**
 * 
 */
class LONodeRenderer extends Component <any, any> 
{       
    deleteNodeFunction:any=null;
    editNodeTitle:any=null;
    linkAnnotation:any=null;
    
    render() {
       //console.log ("Props: " + JSON.stringify (this.props));
                
       var {
            editNodeTitle,
            deleteNode,
            treeData,
            linkAnnotation,     
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
            isOver:     _isOver,     // Not needed, but preserved for other renderers
            parentNode: _parentNode, // Needed for drag-and-drop utils
            endDrag:    _endDrag,    // Needed for drag-and-drop utils
            startDrag:  _startDrag,  // Needed for drag-and-drop utils
            ...otherProps,
       } = this.props;

       let handle;

       this.linkAnnotation=linkAnnotation;
       this.editNodeTitle=editNodeTitle;
       //this.parentTreeData=treeData;
       this.deleteNodeFunction=deleteNode;

       canDrag=true;
        
       let hStyle:any=styles.backupHamburger;

       handle = connectDragSource((
            <div style={styles.orgloadingHandle as any}>
               <div id="handle" style={hStyle}></div>
            </div>
        ), { dropEffect: 'copy' });

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
        gStyle ["opacity"]=isDraggedDescendant ? 0.5 : 1;

        //>--------------------------------------------------------------------

        let dStyle:any=styles.orgrowContents;

        if (canDrag==false) {
            dStyle ["borderLeft"]="solid #BBB 1px"; // Move this to outside the render code ASAP
        }

        //>--------------------------------------------------------------------

        // If we assign the style directly then React freaks out (or TypeScript it's hard to tell)
        // and claims that 'bold' isn't a valid option for fontWeight
        let tStyle:any=styles.orgrowTitle;

        let bStyle:any=styles.orgrowTitle;
        bStyle ["marginLeft"]="2px";
        bStyle ["marginRight"]="2px";
        bStyle ["outline"]="none";

        //>--------------------------------------------------------------------

        var titleObj=new contentTypes.Title({ text: node.title})
        const services = ({} as AppServices);
        const context = { courseModel: null, undoRedoGuid: null, userId: null, documentId: null, resourcePath: null, courseId: null, baseUrl: null};

        return (
            <div style={{ height: '100%', width: '450px' }} {...otherProps}>
                {toggleChildrenVisibility && node.children && node.children.length > 0 && (
                    <div>
                        <button
                            type="button"                            
                            style={handleStyle}
                            onClick={() => toggleChildrenVisibility({node, path, treeIndex})}
                        />

                        {node.expanded && !isDragging &&
                            <div style={nStyle} />
                        }
                    </div>
                )}

                <div style={styles.orgrowWrapper as any}>
                    {/* Set the row preview to be used during drag and drop */}
                    {connectDragPreview(
                     <div style={gStyle}>
                       {handle}
                       <TitleContentEditor 
                        services={services}
                        editMode={true}
                        model={titleObj}
                        context={context}
                        styles={styles.loTitleRenderer}
                        onEdit={(content) => this.editNodeTitle(node,content)} 
                       />
                       <div style={styles.numberStyle}>{node.annotations.length}</div>
                       <a style={bStyle} onClick={(e) => { e.preventDefault(); this.deleteNodeFunction (node)}}><i className="fa fa-window-close"></i>&nbsp;</a>
                       <a style={bStyle} onClick={(e) => { e.preventDefault(); this.linkAnnotation (node)}}><i className="fa fa-plus"></i>&nbsp;</a>
                     </div>
                    )}
                </div>
            </div>
        );
    }
}

export default LONodeRenderer;
