import React from "react";

import Grid from "@material-ui/core/Grid";
import Header from "./components/Header";
import {UnitCards} from "./components/UnitCards";
import LogTable from "./components/LogTable";
import ExperimentSummary from "./components/ExperimentSummary";
import Chart from "./components/Chart";
import AllUnitsManagerCard from "./components/AllUnitsManagerCard";
import ClearChartButton from "./components/ClearChartButton";
import ClearLogButton from "./components/ClearLogButton";
import {parseINIString} from "./utilities"


function Overview() {

  const [experimentMetadata, setExperimentMetadata] = React.useState({})
  const [config, setConfig] = React.useState({})

  React.useEffect(() => {
    async function getLatestExperiment() {
         await fetch("/get_latest_experiment")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setExperimentMetadata(data)
        });
      }

    async function getConfig() {
      await fetch("/get_config/config.ini")
        .then((response) => {
            if (response.ok) {
              return response.text();
            } else {
              throw new Error('Something went wrong');
            }
          })
        .then((config) => {
          setConfig(parseINIString(config)); // TODO: parse on server side and send a json object
        })
        .catch((error) => {})
    }
    getLatestExperiment()
    getConfig();
  }, [])

  const keys = (a) => Object.keys(a)

  return (
      <>
        <Grid container spacing={2} justify="space-between">
          <Grid item xs={12} style={{paddingRight: "0px"}}>
            <Header />
          </Grid>
          <Grid item xs={1} md={12}/>
          <Grid item xs={1} md={12}/>


          <Grid item xs={12} md={1}/>
          <Grid item xs={12} md={10}>
            <ExperimentSummary experimentMetadata={experimentMetadata}/>
          </Grid>
          <Grid item xs={12} md={1}/>


          <Grid item xs={12} md={1}/>
          <Grid item xs={12} md={6} container spacing={2} justify="flex-start" style={{paddingLeft: 0, height: "100%"}}>


            {( config['dashboard.charts'] && (config['dashboard.charts']['implied_growth_rate'] === "1")) &&
            <Grid item xs={12}>
              <Chart
                config={config}
                dataFile={"./data/growth_rate_time_series_aggregating.json"}
                title="Implied growth rate"
                topic="growth_rate"
                yAxisLabel="Growth rate, h⁻¹"
                experiment={experimentMetadata.experiment}
                interpolation="stepAfter"
              />
            </Grid>
            }

            {( config['dashboard.charts'] && (config['dashboard.charts']['fraction_of_volume_that_is_alternative_media'] === "1")) &&
            <Grid item xs={12}>
              <Chart
                config={config}
                domain={[0, 1]}
                dataFile={"./data/alt_media_fraction_time_series_aggregating.json"}
                interpolation="stepAfter"
                title="Fraction of volume that is alternative media"
                topic="alt_media_calculating/alt_media_fraction"
                yAxisLabel="Fraction"
                experiment={experimentMetadata.experiment}
              />
            </Grid>
            }

            {( config['dashboard.charts'] && (config['dashboard.charts']['normalized_135_optical_density'] === "1")) &&
            <Grid item xs={12}>
              <Chart
                config={config}
                isODReading={true}
                dataFile={"./data/od_filtered_time_series_aggregating.json"}
                title="Normalized 135° optical density"
                topic="od_filtered/135/+"
                yAxisLabel="Current OD / initial OD"
                experiment={experimentMetadata.experiment}
                interpolation="stepAfter"
              />
            </Grid>
            }

            {( config['dashboard.charts'] && (config['dashboard.charts']['raw_135_optical_density'] === "1")) &&
            <Grid item xs={12}>
              <Chart
                config={config}
                isODReading={true}
                dataFile={"./data/od_raw_time_series_aggregating.json"}
                title="Raw 135° optical density"
                topic="od_raw/135/+"
                yAxisLabel="Voltage"
                experiment="+"
                interpolation="stepAfter"
              />
            </Grid>
           }
            <Grid item xs={12}> <ClearChartButton experiment={experimentMetadata.experiment}/> </Grid>
          </Grid>

          <Grid item xs={12} md={4} container spacing={2} justify="flex-end" style={{height: "100%"}}>
            <Grid item xs={12} style={{padding: "10px 0px"}}>
              <AllUnitsManagerCard experiment={experimentMetadata.experiment}/>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <UnitCards experiment={experimentMetadata.experiment} config={config} units={config['inventory'] ? keys(config['inventory']).filter((e, i) => (i % 2) === 0) : [] }/>
              </Grid>
              <Grid item xs={6}>
                <UnitCards experiment={experimentMetadata.experiment} config={config} units={config['inventory'] ? keys(config['inventory']).filter((e, i) => (i % 2) === 1)  : [] }/>
              </Grid>
            </Grid>


            <Grid item xs={12} style={{padding: "10px 0px"}}>
              <LogTable config={config}/>
            </Grid>
            <Grid item xs={12}> <ClearLogButton /> </Grid>
          </Grid>

          <Grid item xs={1} md={1}/>
        </Grid>
      </>
  );
}
export default Overview;