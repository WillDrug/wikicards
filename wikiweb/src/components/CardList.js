import * as React from 'react';
import { useState, useRef } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import Container from '@material-ui/core/Container'
import config from "../webconfig.json";
import Divider from '@material-ui/core/Divider'
import {Box, IconButton, TextField} from "@material-ui/core";
import {Search as SearchIcon, Menu as MenuIcon, DoneRounded as UnselectedTagIcon, DoneAllRounded as SelectedTagIcon,
RestartAltRounded as ResetIcon} from "@mui/icons-material"
import {Chip, InputBase, Modal} from "@mui/material";
import Paper from "@mui/material/Paper";
import Typography from "@material-ui/core/Typography";
import './CardList.css'

function get_cards_by_tag(tag) {
    let url = config.base_url+'/api/tag/'+tag;
    return fetch(url).then((response) => {return response.json()})
        .then((responseJson) => {
            if (responseJson.success) {
                if (responseJson.obj.length === 0) {
                    return {cards: null, message: "No cards found"}
                } else {
                    return {cards: responseJson.obj, message: null}
                }
            } else {
                return {cards: null, message: responseJson.message};
            }
        })
        .catch((error) => {
            return {cards: null, message: error.toString()};
        })
}



function generate_card_list(cards) {
    return cards.map((card) => {
        return (
            <div key={card.id+"li_container"}>
                <ListItem key={card.id+"li"} alignItems="flex-start" >
                    <ListItemButton href={'/card/' + card.id}>
                        <ListItemAvatar>
                            <Avatar src={config.base_url + '/image/' + card.preview_image} style={{width: "60px", height: "60px", marginRight: "20px"}}/>
                        </ListItemAvatar>
                        <ListItemText style={{marginBottom: "10px"}}
                            primary={<strong style={{fontSize: "1.5rem"}}>{card.title}</strong>}/>
                    </ListItemButton>

                </ListItem><ListItemText secondary={card.tags.map((tag,i, arr) => {
                let divider = i < arr.length-1 && ", ";
                return <span key={card.id+"tag"+tag}><a href={"/tag/"+tag}>{tag}</a>{divider}</span>
            })} style={{marginTop: "-30px", marginLeft: "115px"}}/>
                <Divider/>
            </div>)
    })
}

const TagModal = (props) => {
    const tags = props.tags
    const [filtered, setFiltered] = useState(tags);
    const [selected, setSelected] = useState([]);
    const tagsearch = useRef('')
    const handleChip = (e, tag) => {
        if (selected.includes(tag)) {
            setSelected(selected.filter((e) => {return e !== tag}))
        } else {
            setSelected([...selected, tag])
        }
    }
    const tag_el = <div>{
        filtered.map((tag, i) => {
            return (
                <Chip key={"tag"+i} onClick={(e) => {handleChip(e, tag)}}
                      variant={selected.includes(tag) ? "filled" : "outlined"} label={tag}
                      icon={selected.includes(tag) ? <SelectedTagIcon/> : <UnselectedTagIcon/>}
                style={{padding: "5px", margin: "10px"}}/>
            )
        })
    }</div>;

    const callClose = () => {
        return props.close(selected)
    }

    const filterTags = (val) => {
        setFiltered(tags.filter((e) => {return e.includes(val)}))
    }

    return (
        <div>
            <Modal
                open={props.open}
                onClose={callClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className={"tagmodal"}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Select the tags
                    </Typography>
                    <TextField
                        sx={{ ml: 1, flex: 1 }}
                        label="Search tags"
                        variant="standard"
                        placeholder="Search tags"
                        inputRef={tagsearch}
                        style={{marginLeft: "20px", marginBottom: "5px"}}
                        onChange={() => {filterTags(tagsearch.current.value)}}
                    /><IconButton sx={{ p: '10px' }} aria-label="menu" onClick={() => {setSelected([]);
                        tagsearch.current.value=""; filterTags("")}}
                                  style={{position: "relative", top: "10px", left: "15px"}}><ResetIcon /></IconButton>
                        {tag_el}

                </Box>
            </Modal>
        </div>
    );
}

const SearchBox = (props) => {
    const [showModal, setModalState] = useState(false);
    const [selected, setSelected] = useState([])
    const title_field = useRef('')
    function onModalClose(selected) {
        setModalState(false);
        setSelected(selected);
        props.propagate(selected);
    }
    return (<Paper
        component="form" style={{marginTop: "10px", marginBottom: "25px", marginLeft: "100px"}}
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
    >
        <IconButton sx={{ p: '10px' }} aria-label="menu" onClick={() => setModalState(true)}>
            <MenuIcon />
        </IconButton>
        <InputBase
            inputRef={title_field}
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search by title"
        />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search"
                    onClick={() => {props.update(title_field.current.value, selected)}}>
            <SearchIcon />
        </IconButton>
            <TagModal open={showModal} close={(selected) => onModalClose(selected)} tags={props.tags}/>

    </Paper>
        )
}

class CardList extends React.Component {
    constructor(props) {
        super(props)
        this.state = { message: 'Loading...', tag: props.tag, tags: [], all_tags: null}
        this.tags = [];

    }

    componentDidMount() {
        fetch(config.base_url+"/api/tag").then((response) => {return response.json()})
            .then((responseJson) => {
                this.setState({all_tags: responseJson.obj})
            })
        if (this.state.tag !== '') {
            get_cards_by_tag(this.state.tag).then((resp) => {
                this.setState({message: resp.message, cards: resp.cards})
            })
        } else {
            this.setState({message: "Use search", cards: null})
        }
    }

    searchCards(tags, title) {
        let url = config.base_url+"/api/search?tags="+encodeURIComponent(tags)+"&title="+encodeURIComponent(title);
        return fetch(url).then((response) => {return response.json()})
            .then((responseJson) => {
                if (responseJson.success) {
                    return responseJson.obj
                }

            })
            .then((cardlst) => {
                if (cardlst.length === 0) {
                    this.setState({message: "nothing found", cards: null})
                } else {
                    this.setState({message: null, cards: cardlst})
                }
            })
            .catch((error) => {
                return {cards: null, message: error.toString()};
            })
    }


    render() {
        let list;
        if (this.state.message !== null) {
            list =
                <ListItem key={"none"}>
                    <ListItemAvatar>
                        <Avatar>
                            <ImageIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={this.state.message} secondary="..." />
                </ListItem>
        } else {
            list = generate_card_list(this.state.cards)
        }
            return (
                <Container maxWidth={"xl"} style={{padding: "12px", textAlign: "justify"}} onKeyDown={(ev) => {
                    if (ev.code === 'Enter') {
                        ev.preventDefault();
                        this.searchCards(this.tags, ev.target.value);
                    }
                }}>
                    {this.state.all_tags !== null ? <SearchBox update={this.searchCards} propagate={(tags) => {this.tags = tags}} tags={this.state.all_tags}/> : <p>Making search work</p>}
                    <List sx={{ width: '100%', marginLeft: "10%", bgcolor: 'background.paper' }}>
                        {list}
                    </List>
                </Container>
            );
    }
}

export default CardList