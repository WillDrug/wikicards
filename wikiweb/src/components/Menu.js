import * as React from 'react';
import Divider from '@mui/material/Divider';
import {Search as SearchIcon, Toc as AggregateIcon, Home as HomeIcon, Tag as TagIcon} from '@mui/icons-material'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const menu = [
    {text: 'Index', icon: <HomeIcon/>, url: '/'},
    {text: '', icon: null, url: ''},
    {text: 'Search', icon: <SearchIcon/>, url: '/tag'},
    {text: 'Tags', icon: <TagIcon/>, url: '/tag/list'},
    {text: 'Aggregate', icon: <AggregateIcon/>, url: '/aggregate'}

]

function generate(item, icon, show, i, url) {
    if (item === '') {
        return <Divider key={i}/>
    }
    let text;
    if (show) {
        text = item;
    } else {
        text = ''
    }
    return (
        <ListItem key={item} disablePadding>
            <ListItemButton href={url}>
                <ListItemIcon>
                    {icon}
                </ListItemIcon>
                <ListItemText primary={text}/>
            </ListItemButton>
        </ListItem>
    )
}

class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            windowSize: window.innerWidth,
            showText: (window.innerWidth >= 1000).valueOf()
        };
    }

    handleResize = e => {
        const windowSize = window.innerWidth;
        const showText = windowSize >= 1000;
        const width = showText ? null : "50px";
        document.getElementById("menu").parentElement.style.maxWidth = width

        this.setState(prevState => {
            return {
                windowSize: windowSize,
                showText: showText
            };
        });
    };

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }
    render() {
        return (
            <span id={"menu"}>
                <Divider />
                <List>
                    {menu.map((item, i) => generate(item.text, item.icon, this.state.showText, i, item.url))}
                </List>
                <Divider />
            </span>
        )
    }
}



export default Menu