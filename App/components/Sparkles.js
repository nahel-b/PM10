import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

// A lightweight sparkle burst overlay. Place it above content (absolute fill) and call ref.burst().
const Sparkles = forwardRef(function Sparkles(
  {
    colors = ['#FFD166', '#06D6A0', '#4CC9F0', '#F72585', '#FFFFFF'],
    particleCount = 14,
    maxRadius = 80,
    sizeRange = [4, 10],
    duration = 800,
    spread = 360, // degrees
    style,
  },
  ref
) {
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(0);

  const burst = useCallback((opts = {}) => {
    const id = ++idRef.current;
    const count = opts.particleCount ?? particleCount;
    const dr = opts.maxRadius ?? maxRadius;
    const dur = opts.duration ?? duration;
    const sp = Math.min(360, Math.max(1, opts.spread ?? spread));

    // Create particles
    const particles = Array.from({ length: count }).map((_, i) => {
      const angleDeg = Math.random() * sp + (360 - sp) / 2; // if spread < 360, center it
      const angle = (angleDeg * Math.PI) / 180;
      const distance = dr * (0.4 + Math.random() * 0.6); // 40%..100% of radius
      const size = Math.round(sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]));
      const color = colors[Math.floor(Math.random() * colors.length)] || '#FFFFFF';
      const progress = new Animated.Value(0);
      const rotateStart = Math.floor(Math.random() * 360);
      const rotateEnd = rotateStart + (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 180);

      return { angle, distance, size, color, progress, rotateStart, rotateEnd };
    });

    const burstObj = { id, particles };
    setBursts((prev) => [...prev, burstObj]);

    Animated.stagger(
      Math.min(20, dur / (particles.length * 2)),
      particles.map((p) =>
        Animated.timing(p.progress, {
          toValue: 1,
          duration: dur - Math.random() * 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    ).start(() => {
      // cleanup finished burst
      setBursts((prev) => prev.filter((b) => b.id !== id));
    });
  }, [colors, duration, maxRadius, particleCount, sizeRange, spread]);

  useImperativeHandle(ref, () => ({ burst }), [burst]);

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {bursts.map((b) => (
        <View key={b.id} style={styles.layer} pointerEvents="none">
          {b.particles.map((p, idx) => {
            const tx = p.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(p.angle) * p.distance],
            });
            const ty = p.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(p.angle) * p.distance],
            });
            const scale = p.progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1.1, 0.8] });
            const opacity = p.progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 0] });
            const rotate = p.progress.interpolate({ inputRange: [0, 1], outputRange: [`${p.rotateStart}deg`, `${p.rotateEnd}deg`] });

            return (
              <Animated.View
                key={idx}
                style={[
                  styles.particle,
                  {
                    width: p.size,
                    height: p.size,
                    borderRadius: p.size / 2,
                    backgroundColor: p.color,
                    opacity,
                    transform: [{ translateX: tx }, { translateY: ty }, { scale }, { rotate }],
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
});

Sparkles.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  particleCount: PropTypes.number,
  maxRadius: PropTypes.number,
  sizeRange: PropTypes.arrayOf(PropTypes.number),
  duration: PropTypes.number,
  spread: PropTypes.number,
  style: PropTypes.any,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});

export default Sparkles;
