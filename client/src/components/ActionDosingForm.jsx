import React, {useState} from 'react'
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  actionTextField: {
    padding: "0px 10px 0px 0px",
    width: "175px",
  },
  actionForm: {
    padding: "20px 0px 0px 0px",
  }
});


const actionToAct = {
  "remove_waste": "Removing waste",
  "add_media": "Adding media",
  "add_alt_media": "Adding alt. media",

}

export default function ActionPumpForm(props) {
  const EMPTYSTATE = "";
  const classes = useStyles();
  const [mL, setML] = useState(EMPTYSTATE);
  const [duration, setDuration] = useState(EMPTYSTATE);
  const [isMLDisabled, setIsMLDisabled] = useState(false);
  const [isDurationDisabled, setIsDurationDisabled] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const [formErrorDuration, setFormErrorDuration] = useState(false)
  const [formErrorML, setFormErrorML] = useState(false)


  function onSubmit(e) {
    e.preventDefault();
    if (mL !== EMPTYSTATE || duration !== EMPTYSTATE) {
      const params = mL !== "" ? { ml: mL, source_of_event: "UI"} : { duration: duration, source_of_event: "UI"};
      fetch(`/run/${props.action}/${props.unit}`, {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      setSnackbarMsg(actionToAct[props.action] + (duration !== EMPTYSTATE ? (" for " +  duration + " seconds.") : (" until " + mL + "mL is reached.")))
      setOpenSnackbar(true);
    }
  }

  function stopPump(e) {
    fetch(`/stop/${props.action}/${props.unit}`, {method: "POST"})
  }

  function runPumpContinuously(e) {
    fetch(`/run/add_media/${props.unit}`, {
      method: "POST",
      body: JSON.stringify({continuously: "", source_of_event: "UI"}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    setSnackbarMsg("Running media pump continuously")
    setOpenSnackbar(true)
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  function handleMLChange(e) {
    const re = /^[0-9.\b]+$/;

    setIsDurationDisabled(true);
    if (e.target.value === EMPTYSTATE) {
      setIsDurationDisabled(false);
    }

    setML(e.target.value);

    if (e.target.value === EMPTYSTATE || re.test(e.target.value)) {
      setFormErrorML(false)
    }
    else {
      setFormErrorML(true)
    }
  }

  function handleDurationChange(e) {
    const re = /^[0-9.\b]+$/;

    setIsMLDisabled(true);
    if (e.target.value === EMPTYSTATE) {
      setIsMLDisabled(false);
    }

    setDuration(e.target.value);

    if (e.target.value === EMPTYSTATE || re.test(e.target.value)) {
      setFormErrorDuration(false)
    }
    else {
      setFormErrorDuration(true)
    }
  }

  return (
    <form id={props.action} className={classes.actionForm}>
      <TextField
        name="mL"
        error={formErrorML}
        value={mL}
        size="small"
        id={props.action + "_mL"}
        label="mL"
        variant="outlined"
        disabled={isMLDisabled}
        onChange={handleMLChange}
        className={classes.actionTextField}
      />
      <TextField
        name="duration"
        value={duration}
        error={formErrorDuration}
        size="small"
        id={props.action + "_duration"}
        label="seconds"
        variant="outlined"
        disabled={isDurationDisabled}
        onChange={handleDurationChange}
        className={classes.actionTextField}
      />
      <br />
      <br />
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <Button
          disabled={formErrorML || formErrorDuration}
          type="submit"
          variant="contained"
          size="small"
          color="primary"
          onClick={onSubmit}
        >
          {props.action.replace(/_/g, " ")}
        </Button>
        <div>
          {props.action === "add_media" && <Button
            size="small"
            color="primary"
            onClick={runPumpContinuously}
          >
            Run continuously
          </Button>
        }
          <Button
            size="small"
            color="secondary"
            onClick={stopPump}
          >
            Interrupt
          </Button>
        </div>
      </div>
      <Snackbar
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
        open={openSnackbar}
        onClose={handleSnackbarClose}
        message={snackbarMsg}
        autoHideDuration={7000}
        key={"snackbar" + props.unit + props.action}
      />
    </form>
  );
}