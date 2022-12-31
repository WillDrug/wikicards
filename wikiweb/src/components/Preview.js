import * as React from 'react';
import './Preview.css'
import get_card, {map_block} from './../CardFunctions'
import config from './../webconfig.json'

class Preview extends React.Component {
    display = 'none';
    constructor(props) {
        super(props)
        this.state = { loaded: false, body: '', title: 'Loading...', img: '' }
    }
    componentDidMount() {
        if (!this.state.loaded) {
            get_card(this.props.card, true).then((resp) => {
                let body, title, img;
                if (resp.message === null) {
                    if (resp.card.id === resp.card.preview_image) {
                        body = '';
                    } else {
                        body = map_block(resp.card.body, '0', true);
                    }
                    title = resp.card.title;
                    img = config.base_url+"/image/"+resp.card.preview_image;
                } else {
                    body = '';
                    title = resp.message;
                    img = '';
                }
                this.setState({loaded: true, body: body, title: title, img: img})
            })
        }
    }
    MouseOver(event, card_id) {
        document.getElementById(card_id+"preview").style.display='inline-block';
    }
    MouseOut(event, card_id) {
        document.getElementById(card_id+"preview").style.display='none';
    }
    render() {
        return (
            <a href={config.base_url+"/card/"+this.props.card} className={"previewlink"}
               onMouseOver={(event) => {this.MouseOver(event, this.props.card)}}
               onMouseOut={(event) => {this.MouseOut(event, this.props.card)}}>{this.props.text}
                <span className="preview" id={this.props.card + "preview"} style={{display: this.display}}>
                    <img src={this.state.img} alt="preview"/>
                    <span><h4>{this.state.title}</h4><br/>
                        {this.state.body}
                        </span>
                </span>
            </a>
        )
    }
}

export default Preview