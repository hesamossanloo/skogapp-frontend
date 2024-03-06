import { Table } from 'reactstrap';

const ForestryTableEstimation2 = () => {
  return (
    <Table>
      <tbody>
        <tr style={{ fontSize: '1.5em', width: '70%' }}>
          <td className="font-weight-bold font-size-lg">
            Forventet bruttoverdi av hogstmoden skog i dag
          </td>
          <td style={{ width: '30%' }}>7 000 000 NOK</td>
        </tr>
        <tr style={{ fontSize: '1.5em', width: '70%' }}>
          <td className="font-weight-bold font-size-lg">
            Forventet brutto nåverdi av fremtidig hogst ved foreslått
            ungskogpleieog avstandsregulering
          </td>
          <td style={{ width: '30%' }}>8 400 000 NOK</td>
        </tr>
        <tr style={{ fontSize: '1.5em', width: '70%' }}>
          <td className="font-weight-bold">
            Forventet brutto nåverdi av fremtidig hogst uten ungskogpleie
          </td>
          <td style={{ width: '30%' }}>5 600 000 NOK</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default ForestryTableEstimation2;
