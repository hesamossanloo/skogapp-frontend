/* eslint-disable react/react-in-jsx-scope */
/*!

=========================================================
* Black Dashboard React v1.2.2
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Map from 'views/Map.js';

var routes = [
  {
    path: '/map',
    name: 'Map',
    rtlName: 'خرائط',
    icon: 'tim-icons icon-map-big',
    component: <Map />,
    layout: '/admin',
  },
];
export default routes;
