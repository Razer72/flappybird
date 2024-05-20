import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import birdImage from '../img/bird.png';

export default function Game() {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [birdPosition, setBirdPosition] = useState(200);
    const [birdVisible, setBirdVisible] = useState(false);
    const [towers, setTowers] = useState([]);

    const birdWidth = 50;  // Assuming a width for the bird
    const birdHeight = 50; // Assuming a height for the bird
    const towerWidth = 80;
    const towerGap = 150;
    const initialOffset = window.innerWidth;

    useEffect(() => {
        if (gameStarted && !gameOver) {
            const gravityTimer = setInterval(() => {
                setBirdPosition(prevPosition => {
                    const newPosition = prevPosition + 5;
                    if (newPosition >= window.innerHeight - 50) {
                        clearInterval(gravityTimer);
                        setGameOver(true); // Ensure game over is set when bird hits the bottom
                        return prevPosition;
                    }
                    checkCollision(newPosition);
                    return newPosition;
                });
            }, 30);
            return () => clearInterval(gravityTimer);
        }
    }, [gameStarted, gameOver]);

    const checkCollision = (newBirdPosition) => {
        const birdBottom = newBirdPosition + birdHeight;
        const birdLeft = window.innerWidth * 0.1; // 10% from the left as pixels
        const birdRight = birdLeft + birdWidth;
    
        console.log("Checking collision"); // Debug output
    
        towers.forEach((tower, index) => {
            const towerRight = tower.position + towerWidth;
            const towerTop = tower.top ? 0 : window.innerHeight - tower.height;
            const towerBottom = tower.top ? tower.height : window.innerHeight;
    
            if (birdRight > tower.position && birdLeft < towerRight) {
                if (birdBottom > towerTop && newBirdPosition < towerBottom) {
                    console.log(`Collision with tower ${index}: Bird bottom=${birdBottom}, Tower top=${towerTop}`); // Debug output
                    setGameOver(true);
                }
            }
        });
    };

    function handleStartGame() {
        setGameStarted(true);
        setGameOver(false);
        setBirdVisible(true);
        setBirdPosition(200);
        setTowers([]);
        createTowers();  // Start creating towers when the game starts
    }

   function handleRestartGame() {
    setGameStarted(false);
    setGameOver(false);
    setBirdVisible(false);
    setBirdPosition(200);
    setTowers([]);
    setTimeout(() => {
        handleStartGame(); // Delay the start to ensure cleanup
    }, 100);
}

    function handleFly() {
        let counter = 0;
        const interval = setInterval(() => {
            if (counter < 15) {
                setBirdPosition(prevPosition => Math.max(prevPosition - 10, 0));
                counter++;
            } else {
                clearInterval(interval);
            }
        }, 20);
    }

    function createTowers() {
        // this should not be an interval, it should be a timeout that recreates itself
        const createTowerTimeout = setTimeout(() => {
            const randomHeight = Math.random() * (window.innerHeight - towerGap);
            setTowers(towers => [...towers, { top: true, height: randomHeight, position: initialOffset }, { top: false, height: window.innerHeight - randomHeight - towerGap, position: initialOffset }]);
            createTowers(); // recursively create towers
        }, 1500);

        return () => clearTimeout(createTowerTimeout);
    }

    useEffect(() => {
        const animateTowersInterval = setInterval(() => {
            setTowers(towers => towers.map(tower => ({
                ...tower,
                position: tower.position - 2 // Move tower left
            })).filter(tower => tower.position + towerWidth > -50)); // Keep towers in bounds
            checkCollision(birdPosition); // Check collision on every tower move
        }, 10);
    
        return () => clearInterval(animateTowersInterval);
    }, [birdPosition]); // Dependency on birdPosition ensures re-check on update

    useEffect(() => {
        const createTowerInterval = setInterval(() => {
            const randomHeight = Math.random() * (window.innerHeight - towerGap);
            setTowers(towers => [
                ...towers, 
                { top: true, height: randomHeight, position: initialOffset },
                { top: false, height: window.innerHeight - randomHeight - towerGap, position: initialOffset }
            ]);
        }, 1500);
    
        return () => clearInterval(createTowerInterval);
    }, []);

    if (gameOver) {
        return (
            <div style={{ backgroundColor: "red", height: "100vh", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h1>You Died</h1>
                <Button style={{ margin: "20px", backgroundColor: "green", border: "none", opacity: "60%" }} onClick={handleRestartGame}>Restart Game</Button>
            </div>
        );
    }
    

    return (
        <div style={{ backgroundColor: "gray", height: "100vh" }} onClick={handleFly} className="mainView">
            {!gameStarted && (
                <>
                    <div>
                        <h1 style={{ textAlign: "center" }}>Prototype</h1>
                    </div>
                    <div style={{ marginTop: "20%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Button style={{ backgroundColor: "green", border: "none", opacity: "60%" }} onClick={handleStartGame}>Start Game</Button>
                    </div>
                </>
            )}
            {birdVisible && <img src={birdImage} alt="Bird" style={{
                width: `${birdWidth}px`,
                height: `${birdHeight}px`,
                position: 'absolute',
                left: '10%',
                top: `${birdPosition}px`,
                transition: 'top 0.1s linear'
            }} />}
            {towers.map((tower, index) => (
                <div key={index} style={{
                    width: `${towerWidth}px`,
                    height: `${tower.height}px`,
                    backgroundColor: 'green',
                    position: 'absolute',
                    left: `${tower.position}px`,
                    top: tower.top ? '0px' : `${window.innerHeight - tower.height}px`
                }} />
            ))}
        </div>
    );
}
