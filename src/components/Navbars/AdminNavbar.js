/* eslint-disable react/prop-types */
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
import React, { useEffect, useRef, useState } from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';

// reactstrap components
import {
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Input,
  NavbarBrand,
  Navbar,
  NavLink,
  Nav,
  Container,
  NavbarToggler,
  InputGroup,
} from 'reactstrap';

function AdminNavbar(props) {
  const [collapseOpen, setcollapseOpen] = useState(false);
  const [isMapInUrl, setIsMapInUrl] = useState(false);
  const [color, setcolor] = useState('navbar-map');
  const [search, setSearch] = useState('');
  const searchInputRef = useRef(null);

  const handleClearSearch = () => {
    setSearch('');
    searchInputRef.current.focus(); // Focus the input after clearing it
  };
  useEffect(() => {
    window.addEventListener('resize', updateColor);
    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener('resize', updateColor);
    };
  });
  // function that adds color white/transparent to the navbar on resize (this is for the collapse)
  const updateColor = () => {
    if (window.innerWidth < 993 && collapseOpen) {
      setcolor('bg-white');
    } else {
      setIsMapInUrl(window.location.href.includes('map'));
      isMapInUrl ? setcolor('navbar-map') : setcolor('navbar-transparent');
    }
  };
  // this function opens and closes the collapse on small devices
  const toggleCollapse = () => {
    setIsMapInUrl(window.location.href.includes('map'));
    if (collapseOpen) {
      isMapInUrl ? setcolor('navbar-map') : setcolor('navbar-transparent');
    } else {
      setcolor('bg-white');
    }
    setcollapseOpen(!collapseOpen);
  };
  return (
    <>
      <Navbar className={classNames('navbar-absolute', color)} expand="lg">
        <Container fluid>
          <div className="navbar-wrapper">
            <div
              className={classNames('navbar-toggle d-inline', {
                toggled: props.sidebarOpened,
              })}
            >
              <NavbarToggler onClick={props.toggleSidebar}>
                <span className="navbar-toggler-bar bar1" />
                <span className="navbar-toggler-bar bar2" />
                <span className="navbar-toggler-bar bar3" />
              </NavbarToggler>
            </div>
            <NavbarBrand href="#pablo" onClick={(e) => e.preventDefault()}>
              {props.brandText}
            </NavbarBrand>
          </div>
          <NavbarToggler onClick={toggleCollapse}>
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
          </NavbarToggler>
          <Collapse navbar isOpen={collapseOpen}>
            {/* search input */}
            <InputGroup style={{ marginLeft: '250px' }}>
              <Input
                placeholder="SEARCH"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                innerRef={searchInputRef}
              />
              <button
                aria-label="Close"
                onClick={handleClearSearch}
                className="clear-search"
              >
                <i className="tim-icons icon-simple-remove" />
              </button>
            </InputGroup>
            <Nav className="ml-auto" navbar>
              <UncontrolledDropdown nav>
                <DropdownToggle
                  caret
                  color="default"
                  data-toggle="dropdown"
                  nav
                >
                  <div className="notification d-none d-lg-block d-xl-block" />
                  <i className="tim-icons icon-sound-wave" />
                  <p className="d-lg-none">Notifications</p>
                </DropdownToggle>
                <DropdownMenu className="dropdown-navbar" right tag="ul">
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">
                      Mike John responded to your email
                    </DropdownItem>
                  </NavLink>
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">
                      You have 5 more tasks
                    </DropdownItem>
                  </NavLink>
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">
                      Your friend Michael is in town
                    </DropdownItem>
                  </NavLink>
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">
                      Another notification
                    </DropdownItem>
                  </NavLink>
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">
                      Another one
                    </DropdownItem>
                  </NavLink>
                </DropdownMenu>
              </UncontrolledDropdown>
              <UncontrolledDropdown nav>
                <DropdownToggle
                  caret
                  color="default"
                  nav
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="photo">
                    <img alt="..." src={require('assets/img/anime3.png')} />
                  </div>
                  <b className="caret d-none d-lg-block d-xl-block" />
                  <p className="d-lg-none">Log out</p>
                </DropdownToggle>
                <DropdownMenu className="dropdown-navbar" right tag="ul">
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">Profile</DropdownItem>
                  </NavLink>
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">Settings</DropdownItem>
                  </NavLink>
                  <DropdownItem divider tag="li" />
                  <NavLink tag="li">
                    <DropdownItem className="nav-item">Log out</DropdownItem>
                  </NavLink>
                </DropdownMenu>
              </UncontrolledDropdown>
              <li className="separator d-lg-none" />
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AdminNavbar;
