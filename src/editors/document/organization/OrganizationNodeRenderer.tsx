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
    "height": "100%",
    "whiteSpace": "nowrap",
    "display": "flex",
    "& > *": {
        "boxSizing": "border-box"
    }
    
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
    "border": "solid #bbb 1px",
    "borderLeft": "none",
    "boxShadow": "0 2px 2px -2px",
    "padding": "0 5px 0 10px",
    "borderRadius": "2px",
    "minWidth": "230px",
    "flex": "1 0 auto",
    "display": "flex",
    "alignItems": "center",
    "verticalAlign": "middle",
    "backgroundColor": "white",
    "justifyContent": "space-between"    
  },
  orgrowContentsDragDisabled : {
    "borderLeft": "solid #bbb 1px"
  },
  orgrowLabel : {  
     //@extend %orgrowItem;
    "display": "inline-block",
    "verticalAlign": "middle",
    
    "flex": "0 1 auto",
    "paddingRight": "20px"
  },
  orgrowToolbar : { 
     //@extend %orgrowItem;
     //"display": "inline-block",
    "verticalAlign": "middle",
    
    "flex": "0 1 auto",
    "display": "flex"
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
  orgloadingHandle : {
    //@extend %orgrowItem;
    "display": "inline-block",
    "verticalAlign": "middle",
    
    //@extend %orgmoveHandle;      
    "height": "100%",
    "width": "44px",
    "border": "solid #aaa 1px",
    "boxShadow": "0 2px 2px -2px",
    "borderRadius": "1px",
    "zIndex": 1,      
            
    "cursor": "default",
    "background": "#d9d9d9",
  },
  orgloadingCircle : {
    "width": "80%",
    "height": "80%",
    "margin": "10%",
    "position": "relative"
  },
  orgloadingCirclePoint : {
    "width": "100%",
    "height": "100%",
    "position": "absolute",
    "left": "0",
    "top": "0",
    
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
    "fontWeight": "bold"
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
    "background": "#fff url('data:image/svg+xml;base64,phn2zyb4bwxucz0iahr0cdovl3d3dy53my5vcmcvmjawmc9zdmciihdpzhropsixocigagvpz2h0psixoci+pgnpcmnszsbjed0iosigy3k9ijkiihi9ijgiigzpbgw9iingrkyilz48zybzdhjva2u9iim5odk4otgiihn0cm9rzs13awr0ad0ims45iia+phbhdgggzd0ittqunsa5adkilz48l2c+cjwvc3znpg==') no-repeat center",
    
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
    "background": "#fff url('data:image/svg+xml;base64,phn2zyb4bwxucz0iahr0cdovl3d3dy53my5vcmcvmjawmc9zdmciihdpzhropsixocigagvpz2h0psixoci+pgnpcmnszsbjed0iosigy3k9ijkiihi9ijgiigzpbgw9iingrkyilz48zybzdhjva2u9iim5odk4otgiihn0cm9rzs13awr0ad0ims45iia+phbhdgggzd0ittqunsa5adkilz48cgf0acbkpsjnosa0ljv2osivpjwvzz4kpc9zdmc+') no-repeat center",
    
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
  orgrow_NoFlex : {
    
  },
  orgrowContents_NoFlex : {
    "display": "inline-block"
  },
  orgrowLabel_NoFlex : {    
    "width": "50%"
  },
  orgrowToolbar_NoFlex : {  
    "textAlign": "right",
    "width": "50%"
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
  }     
};

/**
 * 
 */
//class OrganizationNodeRenderer extends Component <NRendererState, NRendererProps> 
class OrganizationNodeRenderer extends Component <any,any>
{
    deleteNodeFunction:any=null;
    editNodeTitle:any=null;

    render() {
        
        //console.log ("Styles: " + JSON.stringify (styles));
        
        var {
            editNodeTitle,
            deleteNode,
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

        this.editNodeTitle=editNodeTitle;        
        this.deleteNodeFunction=deleteNode;

        canDrag=true;
        
        if (canDrag) {
            console.log ("canDrag: " + canDrag);
            
            if (typeof node.children === 'function' && node.expanded) {
                console.log ("create handle ...");
                // Show a loading symbol on the handle when the children are expanded
                // and yet still defined by a function (a callback to fetch the children)
                handle = (
                    <div style={styles.orgloadingHandle}>
                        <div style={styles.orgloadingCircle}>
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                            <div style={styles.orgloadingCirclePoint} />
                        </div>
                    </div>
                );
            } else {
                // Show the handle used to initiate a drag-and-drop
                handle = connectDragSource((
                    <div style={styles.orgmoveHandle as any} />
                ), { dropEffect: 'copy' });
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

        /*
        className={styles.row +
            (isLandingPadActive ? ` ${styles.rowLandingPad}` : '') +
            (isLandingPadActive && !canDrop ? ` ${styles.rowCancelPad}` : '') +
            (isSearchMatch ? ` ${styles.rowSearchMatch}` : '') +
            (isSearchFocus ? ` ${styles.rowSearchFocus}` : '') +
            (className ? ` ${className}` : '')
        }
        style={{
            opacity: isDraggedDescendant ? 0.5 : 1,
            ...style,
        }}
        */

        let gStyle:any=styles.orgrow;
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

        //>--------------------------------------------------------------------

        var titleObj=new contentTypes.Title({ text: node.title})
        const services = ({} as AppServices);

        //>--------------------------------------------------------------------

        return (
            <div
                style={{ height: '100%' }}
                {...otherProps}
            >
                {toggleChildrenVisibility && node.children && node.children.length > 0 && (
                    <div>
                        <button
                            type="button"
                            aria-label={node.expanded ? 'Collapse' : 'Expand'}
                            style={handleStyle}
                            onClick={() => toggleChildrenVisibility({node, path, treeIndex})}
                        />

                        {node.expanded && !isDragging &&
                            <div
                                style={nStyle}
                            />
                        }
                    </div>
                )}

                <div style={styles.orgrowWrapper as any}>
                    {/* Set the row preview to be used during drag and drop */}
                    {connectDragPreview(
                        <div style={gStyle}>

                            {handle}
            
                            <div id="outter" style={dStyle as any}>
                               <div id="inner" style={tStyle}>
                                 <TitleContentEditor 
                                   services={services}
                                   editMode={true}
                                   model={titleObj}
                                   context={{userId: null, documentId: null, courseId: null}}
                                   onEdit={(content) => this.editNodeTitle(node,content)} 
                                    />
                               </div>
                               <a style={bStyle} href="#" onClick={(e) => this.deleteNodeFunction (node)}><i className="fa fa-window-close"></i>&nbsp;</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default OrganizationNodeRenderer;
 
