/*
* This file is part of ArmarX.
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
* @author     Kai Welke (welke at kit dot edu)
* @copyright  2011 Humanoids Group, HIS, KIT
* @license    http://www.gnu.org/licenses/gpl-2.0.txt
*             GNU General Public License
*/

#pragma once

#include <ArmarXCore/interface/core/UserException.ice>

module armarx
{
	/**
	* @throws ResourceUnavailableException Raised if the unit resource is not available.
	**/
    exception ResourceUnavailableException extends UserException
    {
    };

	/**
	* @throws ResourceNotOwnedException Raised if the unit resource is not owned.
	**/
    exception ResourceNotOwnedException extends UserException
    { 
    };
	/**
	* [UnitExecutionState] defines whether a Unit is constructed, initialized, started or stopped.
	**/
    enum UnitExecutionState
    {
        eUndefinedUnitExecutionState,
        eUnitConstructed,
        eUnitInitialized,
        eUnitStarted,
        eUnitStopped
    };
    
	/**
	* Implements an interface to a UnitExecutionManagement.
	**/
    interface UnitExecutionManagementInterface
    {
		/**
		* init is called to initialize the unit before starting it. Virtual method which has to implemented by components inheriting from this interface.
		**/
        void init();
        /**
		* start is called to start the unit. Virtual method which has to implemented by components inheriting from this interface.
		**/
        void start();
        /**
		* stop is called to stopthe unit. Virtual method which has to implemented by components inheriting from this interface.
		**/
        void stop();
        
        /**
		* getExecutionState returns the execution state of the unit. Virtual method which has to implemented by components inheriting from this interface.
		* @return UnitExecutionState
		* @see UnitExecutionState
		**/
        UnitExecutionState getExecutionState();
    };
    
	/**
	* Implements an interface to a UnitResourceManagement.
	**/
    interface UnitResourceManagementInterface
    {
		/**
		* request is called to grant another component exclusive access to this unit.
		**/
        void request() throws ResourceUnavailableException;
        /**
		* release has to be called by an owning unit in order to allow other components to access this unit.
		**/
        void release() throws ResourceNotOwnedException;
    };
	/**
	* Implements an interface to a SensorActorUnit. The SensorActorUnit is the the base component for subsequent actuation and sensor components.
	**/
    interface SensorActorUnitInterface extends UnitExecutionManagementInterface, UnitResourceManagementInterface
    {
    };
};

