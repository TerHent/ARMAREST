/*
* This file is part of ArmarX.
*
* Copyright (C) 2011-2016, High Performance Humanoid Technologies (H2T), Karlsruhe Institute of Technology (KIT), all rights reserved.
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
* @author     Jan Issac <jan dot issac at gmx dot de>
* @copyright  2010 Humanoids Group, HIS, KIT
* @license    http://www.gnu.org/licenses/gpl-2.0.txt
*             GNU General Public License
*/

#pragma once

module armarx
{
    /*!
     * \brief Base class for all ice exceptions in armarx.
     */
    exception UserException
    {
        string reason;
    };

    /*!
     * \brief Exception to indicate some faulty logic within the program such as violating
     * logical preconditions or class invariants and may be preventable.
     */
    exception LogicError extends UserException
    {
    };

    /*!
     * \brief Exception to indicate missing functionality.
     */
    exception NotImplementedYetException extends LogicError
    {
    };

    /*!
     * \brief Exception to indicate an attempt to access
     * elements out of a defined range.
     */
    exception IndexOutOfBoundsException extends LogicError
    {
    };

    /*!
     * \brief Exception to indicate a specific type is invalid in
     * a context.
     */
    exception InvalidTypeException extends LogicError
    {
    };

    /*!
     * \brief Exception to indicate an argument value has not been
     * accepted.
     */
    exception InvalidArgumentException extends LogicError
    {
    };

    /*!
     * \brief Exception to indicate some error due to some runtime behavior
     * (e.g. some factory was not added)
     */
    exception RuntimeError extends UserException
    {
    };

    /*!
     * \brief Exception to indicate a missing initialization.
     */
    exception NotInitializedException extends RuntimeError
    {
        string fieldName;
    };

    /*!
     * \brief Exception to indicate a missing component factory.
     */
    exception NoSuchComponentFactory extends RuntimeError{};

    /*!
     * \brief Exception emitted when a request is send to a server during shutdown.
     */
    exception ServerShuttingDown extends  RuntimeError{};

    /*!
     * \brief Holds data about an exception.
     */
    struct ExceptionData
    {
        string what;
        string typeId;
    };

    exception WrappedException extends UserException
    {
        ExceptionData data;
    };
};

