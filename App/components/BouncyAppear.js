import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import * as Haptics from 'expo-haptics';


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BouncyAppear = ({
	children,
	delay = 0,
	duration = 350,
	initialScale = 0.85,
	style,
	onEnd,
	// Interaction
	onPress,
	onLongPress,
	pressable, // si non défini: devient pressable si onPress/onLongPress fournis
	pressScale = 1.06,
	disabled = false,
	haptic = true,
	hitSlop,
}) => {
	const scale = useRef(new Animated.Value(initialScale)).current;
	const opacity = useRef(new Animated.Value(0)).current;

	const isPressable = (typeof pressable === 'boolean' ? pressable : !!(onPress || onLongPress)) && !disabled;

	// Fusionne proprement le style utilisateur avec notre scale animé
	const flattened = StyleSheet.flatten(style) || {};
	const { transform: userTransform, ...restStyle } = flattened;
	const mergedTransform = Array.isArray(userTransform)
		? [...userTransform, { scale }]
		: userTransform
			? [userTransform, { scale }]
			: [{ scale }];
	const animatedStyle = [
		{ ...restStyle, opacity, transform: mergedTransform },
	];

	const handlePressIn = () => {
		if (!isPressable) return;
				if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		scale.stopAnimation();
		Animated.spring(scale, {
			toValue: Math.max(pressScale, 1.0),
			friction: 7,
			tension: 140,
			useNativeDriver: true,
		}).start();
	};

	const handlePressOut = () => {
		if (!isPressable) return;

		scale.stopAnimation();
		Animated.spring(scale, {
			toValue: 1,
			friction: 7,
			tension: 90,
			useNativeDriver: true,
		}).start();
	};

	useEffect(() => {
		const sequence = Animated.sequence([
			Animated.delay(delay),
			Animated.parallel([
				Animated.timing(opacity, {
					toValue: 1,
					duration: Math.max(1, Math.floor(duration * 0.7)),
					useNativeDriver: true,
				}),
				Animated.spring(scale, {
					toValue: 1,
					// Un compromis pour un effet "bouncy" agréable
					friction: 7,
					tension: 90,
					useNativeDriver: true,
				}),
			]),
		]);

		sequence.start(({ finished }) => {
			if (finished && typeof onEnd === 'function') onEnd();
		});

		return () => {

            try {
				
                
				scale.stopAnimation();
				opacity.stopAnimation();
			} catch (_) {

            }
		};
	}, [delay, duration, initialScale, onEnd, opacity, scale]);

		if (isPressable) {
			return (
				<AnimatedPressable
					disabled={disabled}
					hitSlop={hitSlop}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					onPress={onPress}
					onLongPress={onLongPress}
					accessibilityRole="button"
					style={animatedStyle}
				>
					{children}
				</AnimatedPressable>
			);
		}

		return (
			<Animated.View style={animatedStyle}>
				{children}
			</Animated.View>
		);
};

BouncyAppear.propTypes = {
	children: PropTypes.node,
	delay: PropTypes.number,
	duration: PropTypes.number,
	initialScale: PropTypes.number,
	style: PropTypes.any,
	onEnd: PropTypes.func,
		onPress: PropTypes.func,
		onLongPress: PropTypes.func,
		pressable: PropTypes.bool,
		pressScale: PropTypes.number,
		disabled: PropTypes.bool,
		hitSlop: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.shape({ top: PropTypes.number, left: PropTypes.number, right: PropTypes.number, bottom: PropTypes.number })
		]),
};

export default BouncyAppear;

