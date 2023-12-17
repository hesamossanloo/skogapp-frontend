import React from "react";
import classNames from "classnames";
import { Line, Bar } from "react-chartjs-2";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Row,
  Col,
} from "reactstrap";
import {
  forestAreaData,
  forestAreaOptions,
  treeSpeciesData,
  treeSpeciesOptions,
  treesPerHectareData,
  treesPerHectareOptions
} from '../assets/data/forestDashboardMockData';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bigChartData: "data1"
    };
  }
  setBgChartData = name => {
    this.setState({
      bigChartData: name
    });
  };
  render() {
    return (
      <>
        <div className="content">
          <Row>
            <Col xs="12">
              <Card className="card-chart">
                <CardHeader>
                  <Row>
                    <Col className="text-left" sm="6">
                      <h5 className="card-category">Total Forest Area</h5>
                      <CardTitle tag="h2">Performance</CardTitle>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={forestAreaData} // replace with your data
                      options={forestAreaOptions} // replace with your options
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md="4">
              <Card>
                <CardHeader>
                  <CardTitle tag="h5">Tree Species Distribution</CardTitle>
                  <p className="card-category">Breakdown by species</p>
                </CardHeader>
                <CardBody>
                  <Bar
                    data={treeSpeciesData} // replace with your data
                    options={treeSpeciesOptions} // replace with your options
                  />
                </CardBody>
              </Card>
            </Col>
            <Col md="4">
              <Card>
                <CardHeader>
                  <CardTitle tag="h5">Trees Per Hectare</CardTitle>
                  <p className="card-category">Density of trees</p>
                </CardHeader>
                <CardBody>
                  <Bar
                    data={treesPerHectareData} // replace with your data
                    options={treesPerHectareOptions} // replace with your options
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Dashboard;