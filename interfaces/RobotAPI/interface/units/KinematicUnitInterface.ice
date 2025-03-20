/*
 * This file is part of ArmarX.
 *
 * Copyright (C) 2012-2016, High Performance Humanoid Technologies (H2T), Karlsruhe Institute of Technology (KIT), all rights reserved.
 *
 * ArmarX is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 as
 * published by the Free Software Foundation.
 *
 * ArmarX is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package    ArmarX::Core
 * @author     Christian Boege (boege at kit dot edu)
 * @copyright  2011 Christian Boege
 * @license    http://www.gnu.org/licenses/gpl-2.0.txt
 *             GNU General Public License
 */

#pragma once

#include <RobotAPI/interface/units/UnitInterface.ice>

#include <ArmarXCore/interface/core/UserException.ice>
#include <ArmarXCore/interface/core/BasicTypes.ice>

#include <RobotAPI/interface/core/NameValueMap.ice>

module armarx
{
	/**
	* Struct RangeViolation for checking whether a given value is in given bounds:
	**/
    struct RangeViolation
    {
		/**
		* @param rangeFrom Lower bound.
		* @param rangeTo Upper bound.
		* @param actualValue Actual value to be checked.
		**/
        float rangeFrom;
        float rangeTo;
        float actualValue;
    };

	/**
	* @param RangeViolationSequence Sequence of values and corresponding bounds to be checked.
	**/
    sequence<RangeViolation> RangeViolationSequence;
	/**
	* @throws OutOfRangeException Raised if value is violating the bounds.
	**/
    exception OutOfRangeException extends UserException
    {
        RangeViolationSequence violation;
    };
	/**
	* [ControlMode] defines the different modes which a KinematicUnit can be controlled.
	**/
    enum ControlMode
    {
        eDisabled,
        eUnknown,
        ePositionControl,
        eVelocityControl,
        eTorqueControl,
        ePositionVelocityControl
    };
	/**
	* [OperationStatus] defines whether a KinematicUnit is online, offline, or initialized.
	**/
    enum OperationStatus
    {
        eOffline,
        eOnline,
        eInitialized
    };
    /**
	* [ErrorStatus] defines the error status of a KinematicUnit.
	**/
    enum ErrorStatus
    {
        eOk,
        eWarning,
        eError
    };
    /**
	* JointStatus combines OperationStatus and ErrorStatus to describe the status of a joint.
	* @see OperationStatus
	* @see ErrorStatus
	**/
    struct JointStatus
    {
        OperationStatus operation;
        ErrorStatus error;
        
        bool enabled;
        bool emergencyStop;
    };
	/**
	* ControlModeNotSupportedException Raised if a mode is requested which is not supported
	* @see ControlMode
	**/
    exception ControlModeNotSupportedException extends UserException
    {
        ControlMode mode;
    };
	/**
	* KinematicUnitUnavailable Raised if the resource KinematicUnit is not available.
	**/
    exception KinematicUnitUnavailable extends ResourceUnavailableException
    {
        StringStringDictionary nodeOwners;
    };
	/**
	* KinematicUnitNotOwnedException Raised if the resource KinematicUnit is not owned.
	**/
    exception KinematicUnitNotOwnedException extends ResourceNotOwnedException
    {
        Ice::StringSeq nodes;
    };

    /**
    * [NameControlModeMap] defined. This data container is mostly used to assign control modes to e.g. joints which are identified by name.
    **/
    dictionary<string, ControlMode> NameControlModeMap;
    /**
    * [ControlModeBoolMap] defined. This data container is mostly used to signal for each control mode, whether it is supported by some component (e.g. a RobotUnit).
    **/
    dictionary<ControlMode, bool> ControlModeBoolMap;
    /**
	* [NameStatusMap] defined. This data container is mostly used to a status to e.g. a joint which is identified by name.
	**/
    dictionary<string, JointStatus> NameStatusMap;
	/**
	* Implements an interface to an KinematicUnit.
	**/


    struct DebugInfo
    {
        NameControlModeMap jointModes;

        NameValueMap jointAngles;
        NameValueMap jointVelocities;
        NameValueMap jointAccelerations;

        NameValueMap jointTorques;
        NameValueMap jointCurrents;

        NameValueMap jointMotorTemperatures;

        NameStatusMap jointStatus;
    };

    interface KinematicUnitInterface extends SensorActorUnitInterface
    {
        /**
         * Requesting and releasing joints guarantees that a joint is controlled by exactly
         * one component at any time
         * 
         * The request only affects the active access, sensor values can always be read.
         *
         */
        void requestJoints(Ice::StringSeq joints) throws KinematicUnitUnavailable;
        /**
         * After usage joints should be released so that another component can get access to these joints.
         */
        void releaseJoints(Ice::StringSeq joints) throws KinematicUnitNotOwnedException;
        
        /**
         * 
         * switchControlMode allows switching control modes of joints specified in targetJointModes.
         * @param targetJointModes defines target control modes and corresponding joints.
         */
        void switchControlMode(NameControlModeMap targetJointModes) throws ControlModeNotSupportedException;
        
        /*
         * Depending on the chosen control mode, one or more of the following functions need to be called
         * to set all necessary parameters.
         * 
         * The motion starts immediately.
         */
        void setJointAngles(NameValueMap targetJointAngles) throws OutOfRangeException;
        void setJointVelocities(NameValueMap targetJointVelocities) throws OutOfRangeException;
        void setJointTorques(NameValueMap targetJointTorques) throws OutOfRangeException;
        void setJointAccelerations(NameValueMap targetJointAccelerations) throws OutOfRangeException;
        void setJointDecelerations(NameValueMap targetJointDecelerations) throws OutOfRangeException;
        
        ["cpp:const"] NameValueMap   getJointAngles();
        ["cpp:const"] NameValueMap   getJointVelocities();
        ["cpp:const"] Ice::StringSeq getJoints();
        
        /*!
         * Returns the current control mode setup of all joints.
         * @return List with current control modes
         */
        NameControlModeMap getControlModes();

        /**
         * @return the robot xml filename as specified in the configuration
         */
        ["cpp:const"]
        idempotent
        string getRobotFilename();

        /**
         * @return All dependent packages, which might contain a robot file.
         */
        ["cpp:const"]
        idempotent
        Ice::StringSeq getArmarXPackages();

        /**
         * @return The name of the robot used by this component.
         *
         */
        ["cpp:const"]
        idempotent string getRobotName() throws NotInitializedException;

        /**
         * @return The name of the robot node set that is used by this component.
         *
         */
        ["cpp:const"]
        idempotent string getRobotNodeSetName() throws NotInitializedException;

        /**
         * @return The name of the report topic that is offered by this unit.
         *
         */
        ["cpp:const"]
        idempotent string getReportTopicName() throws NotInitializedException;

                /*
         * NYI
         */
        //void set Trajectory(...);


        /**
         * @brief This is a 'all-in-one' function to retrieve all info that the kinematic unit can provide.
         * 
         * This reduces the number of required network calls for, e.g., the KinematicUnitGui.
         * 
         * @return 
         *
         */
        ["cpp:const"]
        DebugInfo getDebugInfo();
    };


    

	/**
	* Implements an interface to an KinematicUnitListener.
	**/
    interface KinematicUnitListener
    {
		/**
		* reportControlModeChanged reports if a ControlMode has changed.
		* @param actualJointModes Map of control modes and corresponding joint names.
		* @param aValueChanged Is set to true if a mode has changed.
		**/
        void reportControlModeChanged(NameControlModeMap actualJointModes, long timestamp, bool aValueChanged);
		/**
		* reportJointAngles reports joint angle values.
		* @param actualJointAngles Map of joint angle values and corresponding joint names.
		* @param aValueChanged Is set to true if a joint angle value has changed.
		**/
        void reportJointAngles(NameValueMap actualJointAngles, long timestamp, bool aValueChanged);
        
		/**
		* reportJointVelocities reports joint angle velocities.
		* @param actualJointVelocities Map of joint angle velocities and corresponding joint names.
		* @param aValueChanged Is set to true if a joint angle velocity has changed.
		**/
        void reportJointVelocities(NameValueMap actualJointVelocities, long timestamp, bool aValueChanged);
        
		/**
		* reportJointTorques reports joint torques.
		* @param actualJointTorques Map of joint torques and corresponding joint names.
		* @param aValueChanged Is set to true if a joint torque has changed.
		**/
        void reportJointTorques(NameValueMap actualJointTorques, long timestamp, bool aValueChanged);
        
		/**
		* reportJointAccelerations reports joint accelerations.
		* @param actualJointAccelerations Map of joint accelerations and corresponding joint names.
		* @param aValueChanged Is set to true if a joint acceleration has changed.
		**/
        void reportJointAccelerations(NameValueMap actualJointAccelerations, long timestamp, bool aValueChanged);
        
		/**
		* reportJointCurrents reports joint currents.
		* @param actualJointCurrents Map of joint currents and corresponding joint names.
		* @param aValueChanged Is set to true if a joint current has changed.
		**/
        void reportJointCurrents(NameValueMap actualJointCurrents, long timestamp, bool aValueChanged);
		
		/**
		* reportJointMotorTemperatures reports joint motor temperatures.
		* @param actualJointMotorTemperatures Map of joint motor temperatures and corresponding joint names.
		* @param aValueChanged Is set to true if a joint motor temperature has changed.
		**/
        void reportJointMotorTemperatures(NameValueMap actualJointMotorTemperatures, long timestamp, bool aValueChanged);
        
		/**
		* reportJointStatuses reports current joint statuses.
		* @param actualJointStatuses Map of joint statuses and corresponding joint names.
		* @param aValueChanged Is set to true if a joint status has changed.
		**/
        void reportJointStatuses(NameStatusMap actualJointStatuses, long timestamp, bool aValueChanged);
    };
    
    /*interface KinematicUnitHandInterface extends KinematicUnitInterface
    {
        void open();
        void close();
        void resetTactileSensors(bool r);

        void getObjectPoseInHandFrame();
        void getHandPoseInObjectFrame();
    };*/

    /*interface KinematicUnitHandListener
    {
        void reportTactileSensorData(NameValueMap actualTactileSensorData);
        void reportTactileSensorRawData(NameValueMap actualTactileSensorRawData);
        void reportTactileSensorContactData(NameValueMap actualTactileSensorContactData);
    };*/

};
