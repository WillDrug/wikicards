import config from "./webconfig.json";
import Divider from "@material-ui/core/Divider";
import * as React from "react";
import CardLink from './components/CardLink'
import CardHeader from './components/CardHeader'


function get_card(card_id, preview=false) {
    let url = config.base_url+'/api/card/'+card_id;
    if (preview) {
        url = url + "?preview";
    }
    return fetch(url).then((response) => {return response.json()})
        .then((responseJson) => {
            if (responseJson.success) {
                return {card: responseJson.obj, message: null}
            } else {
                return {card: null, message: responseJson.message};
            }
        })
        .catch((error) => {
            return {card: null, message: error.toString()};
        })
}

function get_gallery(card_id) {
    let url = config.base_url+'/api/gallery/'+card_id;
    return fetch(url).then((response) => {return response.json()})
        .then((responseJson) => {
            if (responseJson.success) {
                return {images: responseJson.obj, message: null}
            } else {
                return {images: [], message: responseJson.message};
            }
        })
        .catch((error) => {
            return {images: [], message: error.toString()};
        })
}

function map_block(block, key='0', suppress_preview=false) {
    let parser;
    if (suppress_preview) {
        if (key === '0') {
            parser = (text, k) => {return <div className="preview_text"
                                             style={{whiteSpace: "pre-line"}} key={k}>{text}</div>}
        } else if (block.class === 'Header') {
            parser = (text, k) => {return <span key={k}><br/>{text}<br/></span>}
        } else if (block.class === 'Line') {
            parser = (text, k) => {return <br/>}
        } else if (block.class === 'List') {
            parser = (text, k) => {return <span key={k}><br/>{text}</span>}
        } else {
            parser = (text, k) => {return text}
        }
    } else {
        switch(block.class) {
            case 'TextBlock':
                parser = (text, k) => {
                    return <span key={k}>{text}</span>
                };
                break;
            case 'Header':
                parser = (text, k) => {
                    return <CardHeader key={k} level={block.parms.level} text={text}/>
                };
                break;
            case 'Decorated':
                parser = (text, k) => {
                    if (block.parms.decoration === 'bold') {
                        return (<strong key={k}>{text}</strong>)
                    } else if (block.parms.decoration === 'italic') {
                        return (<em key={k}>{text}</em>)
                    } else if (block.parms.decoration === 'strikethrough') {
                        return (<strike key={k}>{text}</strike>)
                    } else {
                        return (<span key={k}>{text}</span>)
                    }
                };
                break;
            case 'ListContainer':
                parser = (text, k) => {
                    if (block.parms.ordered) {
                        return (<ol key={k} type={1}>{text}</ol>)
                    } else {
                        return (<ul key={k}>{text}</ul>)
                    }
                };
                break;
            case 'List':
                parser = (text, k) => {
                    let key = block.parms.position
                    if (key === null) {
                        key = k
                    }
                    return (<li key={key}>{text}</li>)
                };
                break;
            case 'Line':
                parser = (text, k) => {
                    return (<Divider key={k}/>)
                };
                break;
            case 'Link':
                parser = (text, k) => {
                    return <CardLink key={k} url={block.parms.url} text={text}/>
                };
                break;
            default:
                parser = (text, k) => {
                    return <span key={k}>{text}</span>
                };
                break;
        }
    }
    const test = parser(block.data.map(function(item, i) { // todo this can be better, this is shiiiit.
        if (typeof(item) === 'string') {
            if (!item.trim().includes('\n') && item.includes('\n')) {
                if (item.endsWith('\n\n')) {
                    return item.split('\n').map((l, i) => {return <span key={"splits"+i}><br/>{l}</span>})
                } else {
                    return item
                }
            } else {
                return <span style={{whiteSpace: "pre-line"}} key={"p"+i}>{item}</span> //
            }
        } else {
            return map_block(item, key+i.toString(), suppress_preview)
        }
    }), key)
    return test
}

export default get_card
export {map_block, get_gallery}