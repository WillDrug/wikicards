
import React from 'react'
import TagList from './TagList'
import config from "../webconfig.json";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import {TableCell} from "@material-ui/core";


class Aggregate extends React.Component {
    constructor(props) {
        super(props);
        const path = window.location.pathname.split('aggregate')
        const tag = path[path.length-1].replace('/', '')  // here it's '' or '/tag'
        this.state = {tag: tag !== '' ? tag : null, attrs: null, message: ""}
    }

    componentDidMount() {
        if (this.state.tag) {
            this.setState({message: "Loading..."})
            fetch(config.base_url+'/api/aggregate/'+this.state.tag).then((response) => {return response.json()})
                .then((responseJson) => {
                    this.setState({message: responseJson.message, attrs: responseJson.obj})
                })
                .catch((error) => {
                    this.setState({message: error.toString()})
                })
        }
    }

    generate_table(attrs) {
        // manipulation :)
        let header = ['X']
        let vertical = []
        for (let o in attrs) {
            vertical.push(o)
            for (let k in attrs[o]) {
                if (!(k in header)) {
                    header.push(k)
                }
            }
        }
        if (header.length > vertical.length) {
            const swap = vertical;
            vertical = header.slice(1)
            header = ['X'].concat(swap)
            let nattrs = {}
            for (let o in attrs) {
                for (let k in attrs[o]) {
                    if (!(k in nattrs)) {
                        nattrs[k] = {}
                    }
                    nattrs[k][o] = attrs[o][k]
                }
            }
            attrs = nattrs
        }
        return (<TableContainer component={Paper}>
            <Table aria-label="simple table" >
                <TableHead>
                    <TableRow  style={{backgroundColor: "#cbcbcb"}}>
                    {header.map((o,i) => {
                        return (
                            <TableCell key={"header"+o+i} component={"th"} scope={"row"}>{o}</TableCell>
                        )
                    })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {vertical.map((o, i) => {
                        return (
                            <TableRow key={"orowc"+o+i}>
                                <TableCell component={"th"} scope={"row"} style={{backgroundColor: "#cbcbcb"}}
                                                    key={"objcell"+o}>{o}</TableCell>
                            {header.slice(1).map((h, j) => {
                                return (
                                   <TableCell  component={"th"} scope={"row"}
                                   key={"data"+o+h+i+j}>{attrs[o][h] !== undefined ? attrs[o][h] : ""}</TableCell>
                                )
                            })}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>)
    }

    render() {
        if (this.state.tag === null) {
            return (
                <TagList prefix={"aggregate"}/>
            )
        } else {
            return (
                <div>
                    {this.state.attrs === null ? this.state.message : this.generate_table(this.state.attrs)}
                </div>
            );
        }
    }
}


export default Aggregate