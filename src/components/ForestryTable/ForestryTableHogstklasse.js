import { Table } from 'reactstrap';

const ForestryTableHogstklasse = () => {
  return (
    <div className="forestry-table">
      <Table>
        <thead>
          <tr>
            <th>Hogstklasse</th>
            <th>Dekar</th>
            <th>%</th>
            <th>% u.t.*</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1 Skog under foryngelse</td>
            <td>66.3 dekar</td>
            <td>3%</td>
            <td>33%</td>
          </tr>
          <tr>
            <td>2 Foryngelse og ungskog</td>
            <td>245.3 dekar</td>
            <td>12%</td>
            <td>17%</td>
          </tr>
          <tr>
            <td>3 Yngre produksjonsskog</td>
            <td>644.1 dekar</td>
            <td>31%</td>
            <td>5%</td>
          </tr>
          <tr>
            <td>4 Eldre produksjonsskog</td>
            <td>41.2 dekar</td>
            <td>2%</td>
            <td>36%</td>
          </tr>
          <tr>
            <td>5 Gammel skog</td>
            <td>1097.1 dekar</td>
            <td>52%</td>
            <td>1%</td>
          </tr>
        </tbody>
      </Table>
      <p className="text-muted">
        *Prosent areal med utilfredsstillende tetthet
      </p>
    </div>
  );
};

export default ForestryTableHogstklasse;
