import ToggleSwitch from 'components/ToggleSwitch/ToggleSwitch';
import { MapFilterContext } from 'contexts/MapFilterContext';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import {
  Button,
  Card,
  CardBody,
  Label,
  UncontrolledCollapse,
} from 'reactstrap';

const cardStyle = {
  background: 'transparent',
  boxShadow: 'none',
};

const labelStyle = {
  fontSize: '0.80rem',
};

const Accordion = ({ onChange }) => {
  const [mapFilter] = useContext(MapFilterContext);
  return (
    <>
      <Button color="warning" href="#mapFilter" id="linkToggler">
        FILTER
      </Button>
      <UncontrolledCollapse toggler="#linkToggler" defaultOpen>
        <Card style={cardStyle}>
          <CardBody>
            <div
              style={{ display: 'flex', justifyContent: 'space-between' }}
            ></div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between' }}
            ></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Label style={labelStyle}>HK5</Label>
              <ToggleSwitch
                id="HK5"
                optionLabels={['ON', 'OFF']}
                small
                checked={mapFilter.HK5}
                onChange={() =>
                  onChange((prevState) => ({
                    ...prevState,
                    HK5: !prevState.HK5,
                  }))
                }
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              <Label style={labelStyle}>HK4</Label>
              <ToggleSwitch
                id="HK4"
                optionLabels={['ON', 'OFF']}
                small
                checked={mapFilter.HK4}
                onChange={() =>
                  onChange((prevState) => ({
                    ...prevState,
                    HK4: !prevState.HK4,
                  }))
                }
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              <Label style={labelStyle}>Protected</Label>
              <ToggleSwitch
                id="Protected"
                optionLabels={['ON', 'OFF']}
                small
                checked={mapFilter.Protected}
                onChange={() =>
                  onChange((prevState) => ({
                    ...prevState,
                    Protected: !prevState.Protected,
                  }))
                }
              />
            </div>
          </CardBody>
        </Card>
      </UncontrolledCollapse>
      <style>
        {`
        .card label {
            margin-bottom: 0;
        }
      `}
      </style>
    </>
  );
};

Accordion.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default Accordion;
