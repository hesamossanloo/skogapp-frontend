import { useAuth } from 'contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import Lottie from 'react-lottie';
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  Label,
  UncontrolledTooltip,
} from 'reactstrap';
import { db } from 'services/firebase';
import lottieSuccess from '../../assets/lotties/success.json';
const cardStyle = {
  background: 'transparent',
  boxShadow: 'none',
};
const defaultLottieOptions = {
  loop: false,
  autoplay: true,
  animationData: lottieSuccess,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};
const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
};

const PriceForm = () => {
  const initialState = {
    granSagtommerPrice: '',
    granMassevirkePrice: '',
    furuSagtommerPrice: '',
    furuMassevirkePrice: '',
    bjorkSamsPrice: '',
    hogstUtkPrice: '',
  };
  const { currentUser, userSpeciesPrices, updateUserSpeciesPrices } = useAuth();
  const [formData, setFormData] = useState(userSpeciesPrices || initialState);
  const [isSubmitted, setIsSubmitted] = useState(false); // Step 1

  // Use useEffect to update formData when prices changes
  useEffect(() => {
    setFormData(userSpeciesPrices || initialState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSpeciesPrices]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission if you have a submit handler
    // Firestore: Save formData to a collection named "prices"
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          prices: formData,
        });
        await updateUserSpeciesPrices(formData); // Update prices in the context and Firestore
        setIsSubmitted(true); // Step 2
        setTimeout(() => setIsSubmitted(false), 1500); // Optional: Hide tick after 3 seconds
      } catch (error) {
        console.error('Error adding document: ', error);
        // Handle errors, e.g., show an error message to the user
      }
    }
  };
  const resetForm = (e) => {
    e.preventDefault(); // Prevent form submission if you have a submit handler
    setFormData(initialState);
    setIsSubmitted(false); // Optionally reset the submission state
  };

  const handleChange = async (e) => {
    const { id, value } = e.target;
    setIsSubmitted(false); // Optionally reset the submission state when editing
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };
  return (
    <Card style={cardStyle}>
      <CardBody>
        <form style={{ position: 'relative' }}>
          <Label
            id="tommerPriser"
            style={{ marginBottom: '10px', textDecoration: 'underline' }}
          >
            Tømmerpriser:
          </Label>
          <FaInfoCircle
            id="tommerPriserTT"
            style={{ cursor: 'pointer', marginLeft: '5' }}
          />
          <UncontrolledTooltip target="tommerPriserTT" delay={0}>
            <u>
              <b>Tømmerpriser:</b>
            </u>
            <span>
              <br />
            </span>
            Her kan du skrive inn dine egne estimater på tømmerpris og
            driftskostnader per kubikkmeter. Prisene som fremkommer i
            utgangspunktet er basert på gjennomsnittspriser av solgt virke
            forrige måned.
          </UncontrolledTooltip>
          <FormGroup>
            <Label for="granSagtommerPrice">Gran - Sagtømmer</Label>
            <Input
              name="granSagtommerPrice"
              id="granSagtommerPrice"
              placeholder="e.g. 769"
              style={{ fontSize: '14px' }}
              value={formData.granSagtommerPrice}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="granMassevirkePrice">Gran - Massevirke</Label>
            <Input
              name="gran-massevirke"
              id="granMassevirkePrice"
              placeholder="e.g. 602"
              style={{ fontSize: '14px' }}
              value={formData.granMassevirkePrice}
              onChange={handleChange} // Update this
            />
          </FormGroup>
          <FormGroup>
            <Label for="furuSagtommerPrice">Furu - Sagtømmer</Label>
            <Input
              name="furu-sagtommer"
              id="furuSagtommerPrice"
              placeholder="e.g. 740"
              style={{ fontSize: '14px' }}
              value={formData.furuSagtommerPrice}
              onChange={handleChange} // Update this
            />
          </FormGroup>
          <FormGroup>
            <Label for="furuMassevirkePrice">Furu - Massevirke</Label>
            <Input
              name="furu-massevirke"
              id="furuMassevirkePrice"
              placeholder="e.g. 586"
              style={{ fontSize: '14px' }}
              value={formData.furuMassevirkePrice}
              onChange={handleChange} // Update this
            />
          </FormGroup>
          <FormGroup>
            <Label for="bjorkSamsPrice">Bjørk - Sams</Label>
            <Input
              name="bjork-sams"
              id="bjorkSamsPrice"
              placeholder="e.g. 586"
              style={{ fontSize: '14px' }}
              value={formData.bjorkSamsPrice}
              onChange={handleChange} // Update this
            />
          </FormGroup>
          <FormGroup>
            <Label
              id="driftskostnad"
              style={{ marginBottom: '10px', textDecoration: 'underline' }}
            >
              Driftskostnad:
            </Label>
            <FaInfoCircle
              id="driftskostnadTT"
              style={{ cursor: 'pointer', marginLeft: '5' }}
            />
            <UncontrolledTooltip target="driftskostnadTT" delay={0}>
              <u>
                <b>Driftskostnad:</b>
              </u>
              <span>
                <br />
              </span>
              Du kan også oppgi estimert driftskostnad per kubikkmeter. Da kan
              vi regne på nettoverdier. Per nå tar vi ikke hensyn til faste
              kostnader som oppstart og flytt mv.
            </UncontrolledTooltip>
            <Label for="hogstUtkPrice">Hogst & utkjøring Per m^3:</Label>
            <Input
              name="hogst-utk"
              id="hogstUtkPrice"
              placeholder="e.g. 586"
              style={{ fontSize: '14px' }}
              value={formData.hogstUtkPrice}
              onChange={handleChange} // Update this
            />
          </FormGroup>
          <div style={buttonContainerStyle}>
            <Button
              color="primary"
              type="submit"
              style={{ fontSize: '12px', padding: '8px' }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
            <Button
              color="primary"
              type="submit"
              style={{ fontSize: '12px', padding: '8px' }}
              onClick={resetForm}
            >
              Tilbakestil priser
            </Button>
          </div>
          {isSubmitted && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000, // Ensure it's above other elements
              }}
            >
              <Lottie options={defaultLottieOptions} height={40} width={40} />
            </div>
          )}
        </form>
      </CardBody>
    </Card>
  );
};
export default PriceForm;
