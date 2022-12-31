
import React from 'react'
import Header from './components/Header'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Menu from './components/Menu'
import WikiCard from './components/WikiCard'
import CardList from './components/CardList'
import TagList from './components/TagList'
import Aggregate from './components/Aggregate'
const NavBar = () => {
  return(
      <Header/>
  )
}


function App() {
    let main_comp;
    if (window.location.pathname.startsWith('/card')) {
        main_comp = <WikiCard id={window.location.pathname.replace('/card/', '')}/>
    }  else if (window.location.pathname === '/') {
        main_comp = <WikiCard id={'index'}/>
    } else if (window.location.pathname === '/tag/list') {
        main_comp = <TagList prefix={"tag"}/>
    } else if (window.location.pathname.startsWith('/tag')) {
        main_comp = <CardList tag={window.location.pathname.replace('/tag', '').replace('/', '')}/>
    } else if (window.location.pathname.startsWith('/aggregate')) {
        main_comp = <Aggregate/>
    } else {
        main_comp = <div>Not implemented yet :)</div>
    }
  return (
    <div className="App">
      <NavBar />
        <Container maxWidth={"lg"} style={{paddingTop: "12px", maxWidth: "90%"}}>
            <Grid container>
                <Grid item xs={2} style={{marginTop: "30px"}}><Menu/></Grid>
                <Grid item xs={10} className={"booklike"}>{main_comp}</Grid>
            </Grid>
        </Container>
    </div>
  );
}

export default App;
