/* eslint-disable react/no-unknown-property */
import { useRef, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment } from '@react-three/drei';
import { easing } from 'maath';

function FluidGlass({ mode = 'lens', lensProps = {}, barProps = {}, cubeProps = {}, text = "Fluid Glass" }) {
    const modeProps = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

    return (
        <Canvas camera={{ position: [0, 0, 20], fov: 25 }}>
            <color attach="background" args={['#0a0a0a']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="sunset" />

            <Scene text={text} modeProps={modeProps} />
        </Canvas>
    );
}

function Scene({ text, modeProps }) {
    const glassRef = useRef();
    const { ior = 1.2, thickness = 5, color = '#a855f7' } = modeProps;

    useFrame((state, delta) => {
        if (!glassRef.current) return;
        const { pointer, viewport } = state;
        const v = viewport.getCurrentViewport(state.camera, [0, 0, 15]);

        const destX = (pointer.x * v.width) / 2;
        const destY = (pointer.y * v.height) / 2;

        easing.damp3(glassRef.current.position, [destX, destY, 15], 0.15, delta);
    });

    return (
        <group>
            {/* Background sphere with nebula-like gradient */}
            <mesh position={[0, 0, -10]}>
                <sphereGeometry args={[50, 32, 32]} />
                <meshBasicMaterial color="#1e1b4b" />
            </mesh>

            {/* Floating particles/stars */}
            {[...Array(50)].map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 40,
                        (Math.random() - 0.5) * 40,
                        (Math.random() - 0.5) * 20 - 5
                    ]}
                >
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            ))}

            {/* Glass cylinder */}
            <mesh ref={glassRef} rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[2, 2, 0.5, 64]} />
                <meshPhysicalMaterial
                    color={color}
                    transmission={0.95}
                    thickness={thickness}
                    roughness={0.05}
                    metalness={0}
                    clearcoat={1}
                    clearcoatRoughness={0}
                    ior={ior}
                />
            </mesh>

            {/* Text */}
            <Text
                position={[0, 0, 17]}
                fontSize={0.8}
                letterSpacing={-0.05}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {text}
            </Text>
        </group>
    );
}

export default FluidGlass;
