import React, {useState} from 'react'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from "@material-ui/core/CardActions";
import Button from '@material-ui/core/Button';
import {Client, Message} from 'paho-mqtt';
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/styles";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import InputAdornment from "@material-ui/core/InputAdornment";
import {ButtonActionDialog, ButtonChangeIODialog} from "./UnitCards"

const dividerStyle = {
  marginTop: 4,
  marginBottom: 4,
};


const useStyles = makeStyles({
  root: {
    minWidth: 100,
    marginTop: "15px",
  },
  content: {
    paddingLeft: "15px",
    paddingRight: "15px",
    paddingTop: "10px",
    paddingBottom: "0px",
  },
  unitTitle: {
    fontSize: 17,
    color: "rgba(0, 0, 0, 0.54)",
  },
  unitTitleDialog: {
    fontSize: 20,
    color: "rgba(0, 0, 0, 0.88)",
  },
  textbox: {
    display: "flex",
    fontSize: 13,
  },
  divider: {
    marginTop: 15,
    marginBottom: 10,
  },
  actionForm: {
    padding: "20px 0px 0px 0px",
  },
  actionTextField: {
    padding: "0px 10px 0px 0px",
  },
  suptitle: {
    fontSize: "13px",
    color: "rgba(0, 0, 0, 0.60)",
  },
})


function ButtonAllUnitSettingsDialog(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);


  // MQTT - client ids should be unique
  var client = new Client(
    "ws://pioreactorws.ngrok.io/",
    "webui" + Math.random()
  );

  client.connect({ onSuccess: onConnect });

  function onConnect() {
  }

  function setJobState(job, state) {
    return function () {
      var message = new Message(String(state));
      message.destinationName = [
        "pioreactor",
        props.unitNumber,
        props.experiment,
        job,
        "$state",
        "set",
      ].join("/");
      message.qos = 1;
      client.publish(message);
    };
  }

  function setPioreactorJobState(job_attr, value) {
    var message = new Message(String(value));
    message.destinationName = [
      "pioreactor",
      props.unitNumber,
      props.experiment,
      job_attr,
      "set",
    ].join("/");
    message.qos = 1;
    client.publish(message);
  }

  function setPioreactorJobStateOnEnter(e) {
    if (e.key === "Enter") {
      setPioreactorJobState(e.target.id, e.target.value);
      e.target.value = "";
    }
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  function startPioreactorJob(job_attr){
    return function() {
      fetch("/run/" + job_attr + "/" + props.unitNumber).then(res => {
      })
    }
  }

  function createUserButtonsBasedOnState(job, parentJob=null){
    parentJob = parentJob || job
    return (<div>
        <Button
          disableElevation
          color="primary"
          onClick={startPioreactorJob(job)}
        >
          Start
        </Button>
        <Button
          disableElevation
          color="primary"
          onClick={setJobState(job, "sleeping")}
        >
          Pause
        </Button>
        <Button
          disableElevation
          color="primary"
          onClick={setJobState(job, "ready")}
        >
          Resume
        </Button>
        <Button
          disableElevation
          color="secondary"
          onClick={setJobState(parentJob, "disconnected")}
        >
          Stop
        </Button>
      </div>
  )}

  const odButtons = createUserButtonsBasedOnState("od_reading")
  const grButtons = createUserButtonsBasedOnState("growth_rate_calculating")
  const ioButtons = createUserButtonsBasedOnState("io_controlling", "algorithm_controlling")


  return (
    <div>
      <Button color="primary" size="small" onClick={handleClickOpen}>
        Settings
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>
          <Typography className={classes.suptitle} color="textSecondary">
            All units
          </Typography>
          <Typography className={classes.unitTitleDialog}>
            Settings
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Optical density reading
          </Typography>
          <Typography variant="body2" component="p">
            Pause or restart the optical density reading. This will also pause
            downstream jobs that rely on optical density readings, like growth
            rates.
          </Typography>

          {odButtons}

          <Divider className={classes.divider} />
          <Typography  gutterBottom>
            Growth rate calculating
          </Typography>
          <Typography variant="body2" component="p">
            Pause or start the calculating the implied growth rate and smooted
            optical densities.
          </Typography>

          {grButtons}

          <Divider className={classes.divider} />
          <Typography gutterBottom>
            Input/output events
          </Typography>
          <Typography variant="body2" component="p">
            Pause media input/output events from occuring, or restart them.
          </Typography>

          {ioButtons}

          <Divider className={classes.divider} />
          <Typography gutterBottom>
            Volume per dilution
          </Typography>
          <Typography variant="body2" component="p">
            Change the volume per dilution. Typical values are between 0.0mL and
            1.5mL.
          </Typography>
          <TextField
            size="small"
            id="io_controlling/volume"
            label="Volume per dilution"
            InputProps={{
              endAdornment: <InputAdornment position="end">mL</InputAdornment>,
            }}
            variant="outlined"
            onKeyPress={setPioreactorJobStateOnEnter}
            className={classes.textField}
          />
          <Divider className={classes.divider} />
          <Typography  gutterBottom>
            Target optical density
          </Typography>
          <Typography variant="body2" component="p">
            Change the target optical density. Typical values are between 1.0 and
            2.5 (arbitrary units)
          </Typography>
          <TextField
            size="small"
            id="io_controlling/target_od"
            label="Target optical density"
            InputProps={{
              endAdornment: <InputAdornment position="end">AU</InputAdornment>,
            }}
            variant="outlined"
            onKeyPress={setPioreactorJobStateOnEnter}
            className={classes.textField}
          />

          <Divider className={classes.divider} />
          <Typography  gutterBottom>
            Duration between dilutions
          </Typography>
          <Typography variant="body2" component="p">
            Change how long to wait between dilutions. Typically between 5 and 90 minutes.
          </Typography>
          <TextField
            size="small"
            id="io_controlling/duration"
            label="Duration"
            InputProps={{
              endAdornment: <InputAdornment position="end">min</InputAdornment>,
            }}
            variant="outlined"
            onKeyPress={setPioreactorJobStateOnEnter}
            className={classes.textField}
          />

          <Divider className={classes.divider} />
          <Typography  gutterBottom>
            Target growth rate
          </Typography>
          <Typography variant="body2" component="p">
            Change the target hourly growth rate - only applicable in{" "}
            <code>morbidostat</code> mode. Typical values are between 0.05h⁻¹ and
            0.4h⁻¹.
          </Typography>
          <TextField
            size="small"
            id="io_controlling/target_growth_rate"
            label="Target growth rate"
            InputProps={{
              endAdornment: <InputAdornment position="end">h⁻¹</InputAdornment>,
            }}
            variant="outlined"
            onKeyPress={setPioreactorJobStateOnEnter}
            className={classes.textField}
          />
          <Divider className={classes.divider} />
          <Typography  gutterBottom>
            IO algorithm
          </Typography>
          <Typography variant="body2" component="p">
            Change which IO algorithm is running on this unit, and set the initial settings.
          </Typography>

          <ButtonChangeIODialog
            unitNumber={'$broadcast'}
            title="All units"
            config={{}}
            experiment={props.experiment}
          />
          <Divider className={classes.divider} />
      </DialogContent>
    </Dialog>
  </div>
  );
}


 function ButtonConfirmStopProcessDialog() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const onConfirm = () => {
      fetch("/stop")
      handleClose()
  }


  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button color="secondary" size="small" onClick={handleClickOpen}>
        Stop all processes
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Stop all pioreactor processes?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This will stop stirring, optical density measuring, and future IO events from occurring for <b>all</b> pioreactor units. It may take a moment to
            take effect.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onConfirm} color="primary">
            OK
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}



class VolumeThroughputTally extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        mediaThroughputPerUnit: {},
        altMediaThroughputPerUnit: {},
        mediaThroughput: 0,
        altMediaThroughput: 0,
        mediaRate: 0,
        altMediaRate: 0,
      };
    this.onConnect = this.onConnect.bind(this);
    this.onMessageArrived = this.onMessageArrived.bind(this);
  }

  async getRecentRates() {
     await fetch("/recent_media_rates/" + this.props.experiment)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      this.setState(data)
    });
  }

  componentDidMount() {
    this.client = new Client("ws://pioreactorws.ngrok.io/", "client-throughput");
    this.client.connect({'onSuccess': this.onConnect});
    this.client.onMessageArrived = this.onMessageArrived;
  }

  componentDidUpdate(prevProps) {
     if (prevProps.experiment !== this.props.experiment) {
      this.getRecentRates()
     }
  }

  onConnect() {
      this.client.subscribe(["pioreactor", "+", this.props.experiment, "throughput_calculating", "alt_media_throughput"].join("/"))
      this.client.subscribe(["pioreactor", "+", this.props.experiment, "throughput_calculating", "media_throughput"].join("/"))
  }

  addOrUpdate(hash, object, value) {
      if (Object.hasOwnProperty(hash)){
        object[hash] = value + object[hash]
      }
      else{
        object[hash] = value
      }
      return object
  }

  onMessageArrived(message) {
    const topic = message.destinationName
    const topicParts = topic.split("/")
    const payload = parseFloat(message.payloadString)
    const unit = topicParts[1]
    const objectRef = (topicParts.slice(-1)[0] === "alt_media_throughput")  ? "altMediaThroughputPerUnit"  : "mediaThroughputPerUnit"
    const totalRef = (topicParts.slice(-1)[0] === "alt_media_throughput")  ? "altMediaThroughput"  : "mediaThroughput"

    this.setState({
      [objectRef]: this.addOrUpdate(unit, this.state[objectRef], payload)
    });

    var total = Object.values(this.state[objectRef]).reduce((a, b) => a + b, 0)

    this.setState({
      [totalRef]: total
    })

  }
  render(){
    return (
    <div>
        <Divider style={dividerStyle}/>
        <div style={{display: "flex", "fontSize": 14}}>
          <Typography style={{display: "flex", "fontSize": 14, flex: 1, textAlign: "left"}}>
            Media throughput:
          </Typography>
          <span style={{fontFamily: "courier", flex: 1, textAlign: "right"}}>
            {Math.round(this.state.mediaThroughput)}mL (<span className={"underlineSpan"} title="Last 12 hour average, automated IO sources">～{this.state.mediaRate.toFixed(1)}mL/h</span>)
          </span>
        </div>
        <Divider style={dividerStyle}/>
        <div style={{display: "flex", "fontSize": 14}}>
          <Typography style={{display: "flex", "fontSize": 14, flex: 1, textAlign: "left"}}>
            Alt. Media throughput:
          </Typography>
          <span style={{fontFamily: "courier", flex: 1, textAlign: "right"}}>{Math.round(this.state.altMediaThroughput)}mL (<span className={"underlineSpan"} title="Last 12 hour average, automated IO sources">～{this.state.altMediaRate.toFixed(1)}mL/h</span>)</span>
        </div>
      <Divider style={dividerStyle}/>
    </div>
  )}
}


const AllUnitsManagerCard = (props) => {
    const classes = useStyles();
    return (
      <Card>
        <CardContent>
          <Typography className={classes.unitTitle}>
            All Units
          </Typography>
          <VolumeThroughputTally experiment={props.experiment}/>
        </CardContent>
        <CardActions>
          <ButtonAllUnitSettingsDialog disabled={false} unitNumber={"$broadcast"} experiment={props.experiment}/>
          <ButtonActionDialog
            disabled={false}
            unitNumber={"$broadcast"}
            title="All units"
            isPlural={true}
            config={{}}
            />
          <ButtonConfirmStopProcessDialog/>
        </CardActions>
      </Card>
    )
}

export default AllUnitsManagerCard;
