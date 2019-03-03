import React, { Component } from 'react';
import {Helmet} from "react-helmet";
import autoBind from 'react-autobind';

import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';

import Spinner from './components/Spinner/';
import logo from './assets/logo.png';

const API_URL = 'https://cfopen-api.herokuapp.com/api/v1/open/cfba?gender='

class App extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      category: 'isMen',
      athletes: [],
      filteredAthletes: [],
    };
  }

  componentDidMount() {
    this.fetchAPI('M');
  }

  fetchAPI(division) {
    fetch(`${API_URL}${division}`)
      .then(res => res.json())
      .then(data => { this.setState({ athletes: data }) })
      .catch(err => { console.log('Error happened during fetching!', err); });
  }

  ordinalSuffix(i) {
    const j = i % 10;
    const k = i % 100;
    let suffix = 'th';

    if (j === 1 && k !== 11) {
      suffix = "st";
    } else if (j === 2 && k !== 12) {
      suffix = "nd";
    } else if (j === 3 && k !== 13) {
      suffix = "rd";
    }

    return `${i}${suffix}`;
  }

  toggleCategory(event) {
    const { target } = event;
    const attr = target.getAttribute('dataref');

    this.setState({ category: attr, athletes: [] });
    const fetchCategory = attr === 'isMen' ? 'M' : 'F';
    this.fetchAPI(fetchCategory);
  }

  filterLeaderboard({ target }) {
    this.setState({
      filteredAthletes: this.state.athletes.filter((athlete) => {
        const { competitorName, affiliateName } = athlete;
        return (
          competitorName.toLowerCase().indexOf(target.value.toLowerCase()) >= 0 ||
          affiliateName.toLowerCase().indexOf(target.value.toLowerCase()) >= 0
        )
      }),
    });
  }

  getLeaderboardHead() {
    const w = parseInt(window.innerWidth, 10);
    let elem = null;

    if (w <= 768) {
      elem = (
        <tr>
          <th scope="col">
            <h4>Atletas</h4>
          </th>
        </tr>
      );
    } else if (w <= 1320) {
      elem = (
        <tr>
          <th scope="col">Atletas</th>
          <th scope="col">19.1</th>
          <th scope="col">19.2</th>
          <th scope="col">19.3</th>
          <th scope="col">19.4</th>
          <th scope="col">19.5</th>
        </tr>
      );
    } else {
      elem = (
        <tr>
          <th scope="col">#</th>
          <th scope="col">Atletas</th>
          <th scope="col">Pontos</th>
          <th scope="col">19.1</th>
          <th scope="col">19.2</th>
          <th scope="col">19.3</th>
          <th scope="col">19.4</th>
          <th scope="col">19.5</th>
        </tr>
      );
    }

    return elem;
  }

  getScoreAsTable(scores) {
    return scores.map((score, index) => {
      let elem = ( score.rank ?
        <td key={index}>
          <strong>{ this.ordinalSuffix(score.rank) }</strong>
          <br />
          <small>({ score.scoreDisplay })</small>
        </td>
        : <td key={index} />
      );

      return elem;
    });
  }

  getScoreAsList(scores) {
    return scores.map((score, index) => {
      const wods = [`19.1:`, `19.2:`, `19.3:`, `19.4:`, `19.5:`];

      let elem = ( score.rank ?
        <li key={wods[index]}>
          <strong> {wods[index]}</strong> {this.ordinalSuffix(score.rank) } ({score.scoreDisplay})
        </li>
        : ''
      );

      return elem;
    });
  }

  getLeaderboardContent(athletes) {
    const w = parseInt(window.innerWidth, 10);
    let elem = null;

    if (w <=   768) {
      elem = athletes.map((athlete, index) => {
        return (
          <tr key={index}>
            <td>
              <Accordion accordion={false}>
                <AccordionItem>
                  <AccordionItemTitle>
                    <h6 className="u-position-relative">
                      <strong>{athlete.overallRank} ({athlete.overallScore}) {athlete.competitorName}</strong>
                      <br /> &nbsp;&nbsp;&nbsp;&nbsp;<small>{athlete.affiliateName}</small>
                      <div className="accordion__arrow" role="presentation" />
                    </h6>
                  </AccordionItemTitle>
                  <AccordionItemBody>
                    <ul>
                        { this.getScoreAsList(athlete.scores) }
                    </ul>
                  </AccordionItemBody>
                </AccordionItem>
              </Accordion>
            </td>
          </tr>
        )
      });
    } else if (w <= 1320) {
      elem = athletes.map((athlete, index) => {
        return (
          <tr key={index}>
            <td>
              <h6>
                <strong>{athlete.overallRank} ({athlete.overallScore}) {athlete.competitorName}</strong>
                <br /> &nbsp;&nbsp;<small>{athlete.affiliateName}</small>
              </h6>
            </td>
            { this.getScoreAsTable(athlete.scores) }
          </tr>
        )
      });
    } else {
      elem = athletes.map((athlete, index) => {
        return (
          <tr key={index}>
            <th scope="row">{ athlete.overallRank }</th>
            <td>
              <strong>{ athlete.competitorName }</strong>
              <br />
              <small>{ athlete.affiliateName }</small>
            </td>
            <td>
              <strong>{ athlete.overallScore }</strong>
            </td>
            { this.getScoreAsTable(athlete.scores) }
          </tr>
        )
      });
    }

    return ( elem );
  }

  render() {
    const { category, athletes, filteredAthletes } = this.state;
    const boostrap = {
      rel: 'stylesheet',
      href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
      integrity: 'sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm',
      crossorigin: 'anonymous',
    };

    const athletesList = filteredAthletes.length ? filteredAthletes : athletes;

    return (
      <div className="App">
        <Helmet
          defaultTitle="2019 Open Crossfit Leaderboard - CFBA"
          meta={[
            { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
            { name: 'description', content: '2019 Open Crossfit Leaderboard CFBA' },
          ]}
          link={[ boostrap ]}
        />

        <div className="container">
          <div className="py-5 text-center">
            <img className="d-block mx-auto mb-4" src={logo} alt="Open Crossfit CFBA" style="width:90px;height:90px;" />

            <div className="row justify-content-md-center">
              <div className="col-md-auto col-lg-4">

                <div className="btn-group">
                  <button className={`btn btn-primary ${ category === 'isMen' ? 'active' : '' }`}
                    dataref="isMen"
                    onClick={this.toggleCategory}
                  >
                    MASCULINO
                  </button>

                  <button className={`btn btn-primary ${ category === 'isWomen' ? 'active' : '' }`}
                    dataref="isWomen"
                    onClick={this.toggleCategory}
                  >
                    FEMININO
                  </button>
                </div>

                <div className="form-group">
                  <input
                    id="searchText"
                    className="form-control leaderboard-search"
                    type="text"
                    name="searchText"
                    onChange={this.filterLeaderboard}
                    placeholder="Pesquise pelo nome do atleta"
                  />
                </div>

              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table id="leaderboardTable" className="table table-striped">
              <thead className="thead-dark">
                { this.getLeaderboardHead() }
              </thead>

              <tbody id="leaderboardBody">
                { this.getLeaderboardContent(athletesList) }
              </tbody>

            </table>

            { athletes.length ? null : <Spinner /> }
          </div>

          <footer className="my-5 pt-5 text-muted text-center text-small">
            <p className="mb-1">&copy; 2019 Open Crossfit Games Leaderboard CFBA</p>
            <p>Desenvolvido por <a href="https://github.com/joaopcanario" target="_blank" rel="noopener noreferrer">João Paulo Canário</a></p>
          </footer>
        </div>
      </div>
    );
  }
}

export default App;
