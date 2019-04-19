import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import Main from './pages/Main';
import Box from './pages/Box';

// cria as rotas da aplicação
const Routes = createAppContainer(
  createSwitchNavigator({
    Main,
    Box
  })
);

export default Routes;
