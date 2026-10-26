import { useId } from "react";
import { locationSuggestions } from "@/app/data/builders";

type Props = {
  location: string;
  onChange: (location: string) => void;
  onContinue: () => void;
};

export default function LocationStep({ location, onChange, onContinue }: Props) {
  const suggestionsId = useId();
  return (
    <form onSubmit={(event) => { event.preventDefault(); onContinue(); }}>
      <p className="panel-description">Start with the town or neighborhood where you own, want to build, or hope to buy. You don’t need an exact address yet.</p>
      <label className="field-label" htmlFor="build-location">Property location</label>
      <div className="location-input-wrap">
        <span aria-hidden="true">⌖</span>
        <input
          id="build-location"
          className="text-input"
          list={suggestionsId}
          placeholder="Try Praia, Santiago"
          value={location}
          maxLength={120}
          required
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <datalist id={suggestionsId}>
        {locationSuggestions.map((place) => <option value={place} key={place} />)}
      </datalist>
      <div className="quick-locations" aria-label="Try a sample location">
        {locationSuggestions.slice(0, 3).map((place) => (
          <button type="button" key={place} onClick={() => onChange(place)}>{place}</button>
        ))}
      </div>
      <p className="field-help">Type any location or choose a sample suggestion. Suggestions are not connected to Google Maps.</p>
      <div className="guidance-note"><span aria-hidden="true">↗</span><p><strong>A clearer path to a builder.</strong><br />The right team starts with where you want to put down roots.</p></div>
      <button className="button primary wide" disabled={!location.trim()} type="submit">Continue <span aria-hidden="true">→</span></button>
    </form>
  );
}
