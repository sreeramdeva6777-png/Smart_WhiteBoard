import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:172.20.10.13:5000");

function Canvas() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;

    socket.on("draw", ({ x, y, prevX, prevY }) => {
      drawLine(ctx, prevX, prevY, x, y);
    });

    socket.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, []);

  function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function startDraw() {
    drawing.current = true;
  }

  function stopDraw() {
  drawing.current = false;

  const canvas = canvasRef.current;
  canvas.lastX = null;
  canvas.lastY = null;
}

  function draw(e) {
    if (!drawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (!canvas.lastX) {
      canvas.lastX = x;
      canvas.lastY = y;
      return;
    }

    drawLine(ctx, canvas.lastX, canvas.lastY, x, y);

    socket.emit("draw", {
      x,
      y,
      prevX: canvas.lastX,
      prevY: canvas.lastY,
    });

    canvas.lastX = x;
    canvas.lastY = y;
  }

  function clearBoard() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    socket.emit("clear");
  }

  return (
    <>
      <button onClick={clearBoard}>Clear Board</button>

      <canvas
        ref={canvasRef}
        style={{ border: "2px solid black", display: "block" }}
        onMouseDown={startDraw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onMouseMove={draw}
      />
    </>
  );
}

export default Canvas;