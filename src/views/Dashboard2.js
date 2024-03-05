import React from 'react';
// nodejs library that concatenates classes
// react plugin used to create charts
import { Pie } from 'react-chartjs-2';

// reactstrap components
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap';

// core components

// forest data
import ForestryTable from 'components/ForestryTable/ForestryTable';
import {
  treeSpeciesData,
  treesPerHectareOptions,
} from '../assets/data/forestDashboardMockData';

function Dashboard2(props) {
  const [bigChartData, setbigChartData] = React.useState('data1');
  const setBgChartData = (name) => {
    setbigChartData(name);
  };
  return (
    <>
      <div className="content">
        <Row>
          <Col lg="3">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Gårds- og bruksnummer: 123-1</h5>
                <CardTitle tag="h2">
                  <i className="tim-icons icon-bell-55 text-info" />
                  Nøkkeltall:
                </CardTitle>
              </CardHeader>
              <CardBody style={{ height: '305px' }}>
                <h4>Totalt areal: 8’000 daa</h4>
                <h4>Produktiv skog: 5’700daa</h4>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6">
            <Card className="card-chart">
              <CardHeader>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-delivery-fast text-primary" />{' '}
                  HOGSTKLASSEFORDELING
                </CardTitle>
              </CardHeader>
              <CardBody>
                <ForestryTable />
              </CardBody>
            </Card>
          </Col>
          <Col lg="3">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Artsprosent</h5>
              </CardHeader>
              <CardBody style={{ height: '350px' }}>
                <Pie data={treeSpeciesData} options={treesPerHectareOptions} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard2;
