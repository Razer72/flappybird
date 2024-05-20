import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import birdImage from '../img/bird.png';

export default function Game() {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [birdPosition, setBirdPosition] = useState(200);
    const [birdVisible, setBirdVisible] = useState(false);
    const [towers, setTowers] = useState([]);

    const birdWidth = 25;  // Width for the bird
    const birdHeight = 25; // Height for the bird
    const towerWidth = 80;
    const towerGap = 200;
    const initialOffset = window.innerWidth;

    useEffect(() => {
        let gravityTimer;
        if (gameStarted && !gameOver) {
            gravityTimer = setInterval(() => {
                setBirdPosition(prevPosition => {
                    const newPosition = prevPosition + 5;
                    if (newPosition >= window.innerHeight - 50) {
                        clearInterval(gravityTimer);
                        setGameOver(true);
                        return prevPosition;
                    }
                    return newPosition;
                });
            }, 30);
            return () => clearInterval(gravityTimer);
        }
    }, [gameStarted, gameOver, birdPosition]);

    useEffect(() => {
        let towerInterval;
        if (gameStarted && !gameOver) {
            towerInterval = setInterval(() => {
                const randomHeight = Math.random() * (window.innerHeight - towerGap);
                setTowers(towers => [
                    ...towers,
                    { top: true, height: randomHeight, position: initialOffset },
                    { top: false, height: window.innerHeight - randomHeight - towerGap, position: initialOffset }
                ]);
            }, 2500);
            return () => clearInterval(towerInterval);
        }
    }, [gameStarted, gameOver]);

    useEffect(() => {
        const moveTowersInterval = setInterval(() => {
            setTowers(towers => {
                const updatedTowers = towers.map(tower => ({
                    ...tower,
                    position: tower.position - 2 // Move tower left
                })).filter(tower => tower.position + towerWidth > 0); // Keep towers on screen
                checkCollision(birdPosition, updatedTowers); // Check for collisions
                return updatedTowers;
            });
        }, 10);
        return () => clearInterval(moveTowersInterval);
    }, [birdPosition, towers]);

    const checkCollision = (birdPos, currentTowers) => {
        const birdBottom = birdPos + birdHeight;
        const birdTop = birdPos;
        const birdLeft = window.innerWidth * 0.1; // 10% from the left as pixels
        const birdRight = birdLeft + birdWidth;
    
        for (const tower of currentTowers) {
            const towerRight = tower.position + towerWidth;
            const towerLeft = tower.position;
    
            // Check horizontal overlap
            if (birdRight > towerLeft && birdLeft < towerRight) {
                if (tower.top) {
                    // Upper tower collision check
                    const towerBottom = tower.height;
                    if (birdTop < towerBottom) {
                        setGameOver(true);
                        return;
                    }
                } else {
                    // Lower tower collision check
                    const towerTop = window.innerHeight - tower.height;
                    if (birdBottom > towerTop) {
                        setGameOver(true);
                        return;
                    }
                }
            }
        }
    };

    function handleStartGame() {
        setGameStarted(true);
        setGameOver(false);
        setBirdVisible(true);
        setBirdPosition(200);
        setTowers([]);
    }

    function handleRestartGame() {
        setGameStarted(false);
        setGameOver(false);
        setBirdVisible(false);
        setBirdPosition(200);
        setTowers([]);
    }

    function handleFly() {
        let counter = 0;
        const interval = setInterval(() => {
            if (counter < 15) {
                setBirdPosition(prevPosition => prevPosition-10)//Math.max(prevPosition - 10, 0));
                counter++;
            } else {
                clearInterval(interval);
            }
        }, 20);
    }

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
