
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import ImageList from '@material-ui/core/ImageList'
import ImageListItem from '@material-ui/core/ImageListItem'
import config from './../webconfig.json'
import * as React from "react";
import get_card, {map_block, get_gallery} from './../CardFunctions'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {Accordion, AccordionDetails, IconButton, ImageListItemBar} from "@material-ui/core";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


function render_gallery(gallery) {
    return gallery.map((image, i) => {
        return (
            <ImageListItem key={"gallery_img"+i} onClick={() => {window.location.pathname='/card/'+image.id}}>
                <img src={config.base_url + '/image/' + image.id} width='auto' alt={image.title}/>
                <ImageListItemBar title={image.title}/>
            </ImageListItem>
        )
    })
}

function constructTable(data, img) {
    let rows = []
    let row2 = []
    for (let attr in data) {
        rows.push(<TableCell component={"th"} scope={"row"} key={attr+"header"}>{attr}</TableCell>)
        row2.push(<TableCell component={"th"} scope={"row"} key={attr+"value"}>{data[attr]}</TableCell>)
    }
    return (<TableContainer component={Paper}>
        <Table aria-label="simple table" >
            <TableHead>
                <TableRow style={{backgroundColor: "#cbcbcb"}}>
                    {rows}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow key={"data"}>{row2}</TableRow>
            </TableBody>
        </Table>
        {img}
    </TableContainer>)
}



class WikiCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = { message: 'Loading...', card: props.id, gallery: [], gallery_message: null, expanded: true}
    }

    switchExpanded() {
        this.setState({expanded: !this.state.expanded})
    }

    componentDidMount() {
        get_card(this.state.card).then((resp) => {
            this.setState({message: resp.message, card: resp.card})
        })
        get_gallery(this.state.card).then((resp) => {
            this.setState({gallery: resp.images, gallery_message: resp.message})
        })

    }

    render() {
        if (this.state.message != null) {
            return (<Container maxWidth={false} style={{padding: "12px", textAlign: "justify"}}>
                    {this.state.message}
                </Container>
            )
        } else {
            let body;
            let float;
            let width, height;
            if (this.state.card.id === this.state.card.preview_image) {
                body = '';
                float = 'unset';
                width = "auto";
                height = "600px";
            } else {
                body = map_block(this.state.card.body);
                float = 'right';
                width = "40%";
                height = "auto";
            }
            return (
                <Container maxWidth={false} style={{padding: "12px", textAlign: "justify"}}>
                    <div>
                        <Typography variant="h3">{this.state.card.title}</Typography>
                        <Typography variant={"caption"}>{this.state.card.tags.map((tag,i, arr) => {
                            let divider = i < arr.length-1 && ", ";
                            return <i key={"caption"+i}><a href={"/tag/"+tag}>{tag}</a>{divider}</i>
                        })}</Typography>
                        {this.state.card.attributes.length > 0 ?
                        <Accordion expanded={this.state.expanded} style={{height: "5%"}}>
                            <IconButton style={{position: "absolute", right: "0px", top: "-50px"}} onClick={() => {this.switchExpanded()}}>
                                <ExpandMoreIcon/>
                            </IconButton>
                            <AccordionDetails>
                                {constructTable(this.state.card.attributes)}
                            </AccordionDetails>
                        </Accordion>
                            : <></>}

                        <Divider/>
                    </div>

                    <div style={{padding: "10px"}}>
                        {this.state.card.preview_image !== null ? <img src={config.base_url + '/image/' + this.state.card.preview_image} width='auto'
                             style={{float: float, clear: "right", marginLeft: "20px", padding: "5px", maxWidth: width,
                                 maxHeight: height, marginRight: "-20px"}} alt="no"/> : <></>}
                        {body}
                    </div>
                    <ImageList sx={{ width: 500, height: 450 }} variant="quilted" cols={3} rowHeight={164}>
                        {this.state.gallery_message === null ? render_gallery(this.state.gallery) :
                            <p>{this.state.gallery_message}</p>}
                    </ImageList>
                    <br/>
                </Container>
            )
        }
    }
}

export default WikiCard