import React from 'react';
import { YellowBox } from 'react-native';
import Routes from './routes';

// esconde os warnings
YellowBox.ignoreWarnings(['Unrecognized WebSocket']);

const App = () => <Routes />;

export default App;
