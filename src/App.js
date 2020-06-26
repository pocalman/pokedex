import React from "react";
import ReactDOM from "react-dom";
import "./App.css";

const Pokemon = 1;

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}




class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            requestRoot: "https://pokeapi.co/api/v2/pokemon/",
            Index: Pokemon,
            pokemonData: {},
            pokemonDescription: "",
            speciesData: {},
            evolutionImages: [],
            evolutionNames: [],
            moves: [],
        };
        this.nextPokemon = this.nextPokemon.bind(this);
        this.previousPokemon = this.previousPokemon.bind(this);
        this.takePokemon = this.takePokemon.bind(this);
    }

    nextPokemon() {
        const next = Math.min(this.state.Index + 1, 949);
        this.setState({ Index: next }, this.changePokemon);
    }

    previousPokemon() {
        const prev = Math.max(this.state.Index - 1, 1);
        this.setState({ Index: prev }, this.changePokemon);
    }

    takePokemon(no) {
        this.setState({ Index: no }, this.changePokemon);
    }

    componentDidMount() {
        this.changePokemon();
    }

    changePokemon() {
        const request = `${this.state.requestRoot}${this.state.Index}/`;
        fetch(request, {

        })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    pokemonData: data,
                   Index: data.id
                });
                const speciesRequest = data.species.url;
                return fetch(speciesRequest);
            })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    speciesData: data,

                    description: pickRandom(
                        data.flavor_text_entries.filter(e => e.language.name === "fr").map(e => e.flavor_text)
                    ),

                });
                const evolution_chain = data.evolution_chain.url;
                fetch(evolution_chain)
                    .then(response => response.json())
                    .then(data => {
                        const api = "https://pokeapi.co/api/v2/pokemon/";
                        const first = data.chain;
                        let second;
                        let third;
                        let evos = [];
                        if (first) {
                            const evolution1 = fetch(`${api}${first.species.name}/`);
                            evos.push(evolution1);
                            second = first.evolves_to[0];
                        }
                        if (second) {
                            const evolution2 = fetch(`${api}${second.species.name}/`);
                            third = second.evolves_to[0];

                            evos.push(evolution2);
                        }
                        if (third) {
                            const e3 = fetch(`${api}${third.species.name}/`);
                            evos.push(e3);
                        }
                        Promise.all(evos)
                            .then(responses => Promise.all(responses.map(value => value.json())))
                            .then(dataList => {
                                const sprites = dataList.map(v => v.sprites.front_default);
                                const names = dataList.map(n => n.name);
                                this.setState({  evolutionImages: sprites, evolutionNames: names });
                            });
                    });
            });
    }

    render() {
        const pokemonData = this.state.pokemonData;
        const speciesData = this.state.speciesData;

        return (
            <div className="pokedex">
                <Left
                    pokemonData={pokemonData}
                    speciesData={speciesData}
                    no={this.state.Index}
                    description={this.state.description}
                />
                <Right
                    pokemonData={pokemonData}
                    speciesData={speciesData}
                    evolutionImages={this.state.evolutionImages}
                    evolutionNames={this.state.evolutionNames}
                    controls={{ next: this.nextPokemon, prev: this.previousPokemon, pick: this.pickPokemon }}
                    no={this.state.Index}
                />
            </div>
        );
    }
}

function Left(props) {
    const pokemonData = props.pokemonData;

 if (typeof pokemonData === "object" && Object.keys(pokemonData).length !== 0) {
        return (
            <div className="cadre">
                <PokemonScreen src={pokemonData.sprites} name={pokemonData.name} no={props.no} />
                <PokemonDescription description={props.description} no={props.no} />
            </div>
        );
    } else {
        return "";
    }
}


class PokemonScreen extends React.Component {


render() {
       
        const img =  this.props.src["front_default"];
        const no=this.props.no
        const name=this.props.name
        return (
            <div class="ecran">
                <div class="name">
                <h1>
                 {no}. {name}
                 </h1>
                 </div>
                <img src={img} alt="pokemon" class="image"  />
            </div>
        );
       }
}


function PokemonDescription(props) {
    return <div className="pokemon-description description">{props.description}</div>;
}





function Right(props) {
    const types = props.pokemonData.types;

    if (types) {
        return (
            <div className="cadre">
                <div className="row">
                    <PokemonType types={types} />
                </div>
                <PokemonEvolution  evolutionImages={props.evolutionImages} evolutionNames={props.evolutionNames} />
                <PokedexControls controls={props.controls} no={props.no} />
            </div>
        );
    } else {
        return "";
    }
}



function PokemonType(props) {
    const types = props.types;
    return (
        <div className="type">
            <div>Types</div>
            <div className="description-type">
                {types.map(t => {
                    const type = t.type.name;
                    return <Type type={type} key={type} />;
                })}
            </div>
        </div>
    );
}

function PokemonEvolution(props) {
    const evolution1 = props.evolutionImages[0];
    const evolution2 = props.evolutionImages[1];
    const evolution3 = props.evolutionImages[2];
    const evolutionName1 = props.evolutionNames[0];
    const evolutionName2 = props.evolutionNames[1];
    const evolutionName3 = props.evolutionNames[2];

    return (
        <div className="row evolution border">

         <div className="header evolution-header">Evolution(s)</div> 
            <PokemonImageSmall src={evolution1} evolution="1" name={evolutionName1} />
            <PokemonImageSmall src={evolution2} evolution="2" name={evolutionName2} />
            <PokemonImageSmall src={evolution3} evolution="3" name={evolutionName3} />
        </div>
    );
}

function PokemonImageSmall(props) {
    let evolutionImage;

    if (props.src) {
        evolutionImage = <img src={props.src} alt="pokemon" className="image small-image" />;
    } else {
        evolutionImage = <Empty />;
    }

    return (
        <div>
            <div className="center">
                <div className="evolution-number">{props.evolution}</div>
            </div>
            {evolutionImage}
            <div className="description evolution-name">{props.name || "No evolution"}</div>
        </div>
    );
}

function Empty() {
    return (
        <div className="image small-image empty">
           <h2>X</h2>
        </div>
    );
}






function PokedexControls(props) {
    return (
        <div className="row controls">
            <ButtonLeft dir="left" onClick={props.controls.prev} />
            <NumberInput no={props.no} func={props.controls.pick} />
            <ButtonRight dir="right" onClick={props.controls.next} />
        </div>
    );
}

function ButtonLeft(props) {
    return <div className="buttonLeft" onClick={props.onClick}></div>;
}

function ButtonRight(props) {
    return <div className="buttonRight" onClick={props.onClick} />;
}


class NumberInput extends React.Component {

    /*Les boutons qui mène d'un Pokemon à l'autre servent de pagination. On peut considérer que chaque page correspond à un ID donc
     à un Pokemon */
    constructor(props) {
        super(props);
        this.state = {
            id: 1
        };
        this.Number = this.Number.bind(this);
        this.Click = this.Click.bind(this);
    }

    Number(e) {
        e.preventDefault();
        this.setState({ id: e.target.value });
    }

    Click(e) {
        e.preventDefault();
        this.props.func(this.state.id);
    }

    render() {
        return (
            <div>
                <input
                    type="number"
                    className="description number"
                    placeholder={this.props.no}
                    onChange={this.Number}
                    min={1}
                    max={810}
                />
                <div className="oval" onClick={this.Click} />
            </div>
        );
    }
}



function Type(props) {
    return <div className={"type "}>{props.type}</div>;
}

ReactDOM.render(<App />, document.getElementById("root"));



export default App;
