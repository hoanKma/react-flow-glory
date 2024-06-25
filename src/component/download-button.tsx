import { toPng } from "html-to-image";
import { getRectOfNodes, getTransformForBounds, useReactFlow } from "reactflow";

function downloadImage(dataUrl: string) {
  console.log(dataUrl);
  const a = document.createElement("a");
  a.setAttribute("download", "reactflow-mindmap.png");
  a.setAttribute("href", dataUrl);
  a.click();
}

const imageWidth = 1600;
const imageHeight = 900;

function DownloadButton() {
  const { getNodes } = useReactFlow();

  const onClick = () => {
    const nodesBounds = getRectOfNodes(getNodes());

    // [x, y, zoom]
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    const viewport = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null;
    if (!viewport) return;

    toPng(viewport, {
      backgroundColor: "#fff",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    })
      .then(downloadImage)
      .catch((error) => {
        console.error("Error generating image:", error);
      });
  };

  return (
    <button
      className="panel-save-restore__download-btn"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      Download Image
    </button>
  );
}

export default DownloadButton;
