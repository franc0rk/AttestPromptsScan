import { useState } from "react";
import { FaFile, FaTrash } from "react-icons/fa";
import { attest } from "../services/eas";

interface FixerProps {
  prompt: string;
  signer: any;
  onAttest: (attestationId: string) => void;
}

const Fixer: React.FC<FixerProps> = ({ prompt, signer, onAttest }) => {
  const [selectedEndpoints, setSelectedEndpoints] = useState<any[]>([]);

  function handleSelectedOptionsChange(e: any, epIndex: number) {
    const newSelectedEndpoints = selectedEndpoints.map((ep, _epIndex) => {
      console.log(epIndex, ep, _epIndex);
      if (_epIndex === epIndex) return e.target.value;
      return ep;
    });
    setSelectedEndpoints(newSelectedEndpoints);
  }

  const [what, setWhat] = useState("");
  const [attestationId, setAttestationId] = useState("");

  async function attestPrompt() {
    const { attestationUid } = await attest(signer, {
      prompt: `${what}`,
      tags: ["#fixes", "#devmode"],
    });

    setAttestationId(attestationUid);
    onAttest(attestationUid);
  }

  return (
    <section className="flex flex-col m-4 border-2 rounded-md messages">
      <div>
        <h2 className="text-2xl font-bold p-4">ChatScout - Fixer</h2>
      </div>
      <div className="p-4">
        <div className="flex flex-col mb-8">
          <div className="text-gray-300 mb-4 text-sm">Prompt: {prompt}</div>
          <label htmlFor="what" className="font-bold mb-2 text-sm">
            What should I do when I receive this and similar prompts?
          </label>
          <textarea
            value={what}
            id="what"
            className="border-2 rounded-md bg-transparent py-2 px-4"
            rows={6}
            placeholder="Example: when users type this prompt 'Show my nfts', 'I wanna see my latest nfts in a gallery format', you should return a content array with one element with the key 'nft-gallery' and component: gallery"
          />
        </div>
        <div className="flex flex-col mb-8">
          <label htmlFor="what" className="font-bold mb-2 text-sm">
            What endpoints from BlockScout API do I need to query?
          </label>

          <div className="px-16 py-4 border-dashed border-2 rounded-md">
            {selectedEndpoints.map((ep, epIndex) => (
              <div className="flex flex-col my-2" key={epIndex}>
                <div className="relative">
                  <div className="absolute right-0">
                    <button
                      onClick={() =>
                        setSelectedEndpoints(
                          selectedEndpoints.filter(
                            (_, _epIndex) => _epIndex !== epIndex
                          )
                        )
                      }
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <label className="mb-1" htmlFor={`ep${epIndex}`}>
                  Select endpoint:
                </label>
                <select
                  id={`ep${epIndex}`}
                  className="rounded-full py-1 bg-transparent border-2 px-4 my-4"
                  onChange={(e) => handleSelectedOptionsChange(e, epIndex)}
                  value={selectedEndpoints[epIndex]}
                >
                  <option className="bg-black text-white" value="">
                    Select an endpoint
                  </option>
                  <option
                    className="bg-black text-white"
                    value="/addresses/{hash}/nfts"
                  >
                    /addresses/{"{hash}"}/nfts
                  </option>
                  <option
                    className="bg-black text-white"
                    value="/addresses/{hash}/tokens"
                  >
                    /addresses/{"{hash}"}/tokens
                  </option>
                </select>
                <label className="mb-2" htmlFor={`notes-ep${epIndex}`}>
                  Notes
                </label>
                <textarea
                  id={`notes-ep${epIndex}`}
                  className="text-sm border-2 rounded-md bg-transparent py-2 px-4"
                  rows={1}
                  placeholder="Example: add filters for..."
                />
              </div>
            ))}
            <div className="flex justify-center my-4">
              <button
                onClick={() => setSelectedEndpoints([...selectedEndpoints, ""])}
                className=" p-2 text-sm font-bold border-2 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => attestPrompt()}
            className=" p-2 text-sm font-bold border-2 rounded-md flex items-center"
          >
            <FaFile className="mr-1" />
            ATTEST
          </button>
          <div className="my-2 text-sm p-4 text-center">
            After attesting the prompt will be evaluated and reviewed for other
            devs, once it has an accepted status ChatScout will be able to
            answer correctly next time.
          </div>
        </div>
      </div>
    </section>
  );
};

export default Fixer;
