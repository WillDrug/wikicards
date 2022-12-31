import Preview from "./Preview";
import * as React from "react";



const CardLink = (props) => {
    if (props.url.startsWith('http')) {
        return (<a href={props.url}>{props.text}</a>)
    } else if (props.suppress) {
        return <span>{props.text}</span>
    } else {
        return (<Preview card={props.url} text={props.text}/>)
    }
}
CardLink.defaultProps = {
    suppress: false
}

export default CardLink