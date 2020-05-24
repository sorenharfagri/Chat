import React from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Join from './components/Join/Join'
import Chat from './components/Chat/Chat'
import NotFound from './components/NotFound/NotFoundPage';

//Join - хоумпейдж, с него пользователи отправляются в рандомную комнату
//Chat - непосредственно страничка чата
//NotFound - страница 404 ошибки

const App = () => (
    <Router>
        <Switch>
          <Route path="/" exact component={Join} />
          <Route path="/chat" exact component={Chat} />
          <Route component={NotFound}/> 
        </Switch>
    </Router>
);

export default App;