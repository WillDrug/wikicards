import Typography from "@material-ui/core/Typography";
import {Box, IconButton, TextField} from "@material-ui/core";
import {PanToolAlt as ClickIcon, RestartAltRounded as ResetIcon} from "@mui/icons-material";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import config from "../webconfig.json";
import {Chip} from "@mui/material";


const TagList = (props) => {
    const [tags, setTags] = useState([])
    const [filtered, setFiltered] = useState(tags);
    const tagsearch = useRef('')

    const filterTags = (val) => {
        setFiltered(tags.filter((e) => {return e.includes(val)}))
    }

    useEffect(() => {
        fetch(config.base_url+"/api/tag").then((response) => {return response.json()})
            .then((responseJson) => {
                setTags(responseJson.obj);
            })
    }, [])

    useEffect(() => {
        setFiltered(tags)
    }, [tags])

    const message = tags.length === 0 ? "Loading..." : "Nothing found"

    const tag_el = <div>{filtered.length > 0 ? filtered.map((tag, i) => {
                return (
                        <Chip key={"tag"+i} onClick={() => {window.location.pathname="/"+props.prefix+"/"+tag}}
                              variant="outlined" label={tag}
                              icon={<ClickIcon/>}
                              style={{padding: "5px", margin: "10px"}}/>
                )
            }) : message}</div>

    return (<Box style={{margin: "10px"}}>
        <Typography id="modal-modal-title" variant="h6" component="h2" style={{marginLeft: "20px"}}>
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
        /><IconButton sx={{ p: '10px' }} aria-label="menu"
                      onClick={() => {tagsearch.current.value=""; filterTags("")}}
                      style={{position: "relative", top: "10px", left: "15px"}}><ResetIcon /></IconButton>
        {tag_el}
    </Box>)
}

export default TagList