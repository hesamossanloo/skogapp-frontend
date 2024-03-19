import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

const DDStyle = {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 9999,
};

const ForestSelector = ({ isOpen, toggle, onSelectForest }) => (
  <Dropdown isOpen={isOpen} toggle={toggle} style={DDStyle}>
    <DropdownToggle caret color="info">
      Choose your Forest
    </DropdownToggle>
    <DropdownMenu>
      <DropdownItem onClick={() => onSelectForest('forest1')}>
        Forest 1
      </DropdownItem>
      <DropdownItem onClick={() => onSelectForest('forest2')}>
        Forest 2
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
);

ForestSelector.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onSelectForest: PropTypes.func.isRequired,
};

export default ForestSelector;
