import * as React from "react";

const CardHeader = (props) => {
    const style={lineHeight: "0.5"}
    if (props.level === 1) {
        return (<h1 style={style}>{props.text}</h1>)
    } else if (props.level === 2) {
        return (<h2 style={style}>{props.text}</h2>)
    } else {
        return (<h3 style={style}>{props.text}</h3>)
    }
}

export default CardHeader