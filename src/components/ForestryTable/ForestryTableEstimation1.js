import { Table } from 'reactstrap';

const ForestryTableEstimation1 = () => {
  return (
    <Table>
      <tbody>
        <tr>
          <td className="font-weight-bold" style={{ width: '70%' }}>
            Total kubikkmass
          </td>
          <td style={{ width: '30%' }}>29 785 m³</td>
        </tr>
        <tr>
          <td className="font-weight-bold" style={{ width: '70%' }}>
            Total kubikkmass i hogstklasse 5
          </td>
          <td style={{ width: '30%' }}>29 785 m³</td>
        </tr>
        <tr>
          <td className="font-weight-bold" style={{ width: '70%' }}>
            Gjennomsnittlig tilvekstprosent
          </td>
          <td style={{ width: '30%' }}>14 500 m³</td>
        </tr>
        <tr>
          <td className="font-weight-bold" style={{ width: '70%' }}>
            Total tilvekst
          </td>
          <td style={{ width: '30%' }}>751 m³</td>
        </tr>
        <tr>
          <td className="font-weight-bold" style={{ width: '70%' }}>
            CO₂ bundet i din skog
          </td>
          <td style={{ width: '30%' }}>58 578 tonn</td>
        </tr>
        <tr>
          <td className="font-weight-bold" style={{ width: '70%' }}>
            Årlig opptak av CO₂
          </td>
          <td style={{ width: '30%' }}>1 598 tonn</td>
        </tr>
        <tr style={{ fontSize: '1.5em' }}>
          <td className="font-weight-bold" style={{ width: '70%' }}>
            Est. Bruttoverdi tømmer i HK5
          </td>
          <td style={{ width: '30%' }}>7 000 000 NOK</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default ForestryTableEstimation1;
