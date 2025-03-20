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
* @author     Kai Welke <welke@kit.edu>
* @copyright  2011 Humanoids Group, HIS, KIT
* @license    http://www.gnu.org/licenses/gpl-2.0.txt
*             GNU General Public License
*/

#pragma once

#include <Ice/BuiltinSequences.ice>
#include <Ice/Identity.ice>

/**
 * @brief Generates a range structure (min,max) for the given type
 */
#define ARMARX_GENERATE_RANGE_STRUCT(type,name)\
    struct name##Range\
    {\
         type min;\
         type max;\
    };\
    sequence<name##Range> name##RangeSeq

/**
 * @brief Generates a dictionary from the key type to the value type
 */
#define ARMARX_GENERATE_DICTIONARY(typek,namek,typev,namev)\
    dictionary<typek,typev> namek##namev##Dictionary;\
    dictionary<typek,typev> namek##namev##Dict

/**
 * @brief Generates a dictionary from the given type to all basic types
 */
#define ARMARX_GENERATE_DICTIONARY_FOR_ALL_VALUE_TYPES(typek,namek)\
    ARMARX_GENERATE_DICTIONARY(typek,namek,bool,Bool);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,byte,Byte);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,short,Short);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,int,Int);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,long,Long);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,float,Float);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,double,Double);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,string,String);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,Ice::Identity,Identity);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,Object,Object);\
    ARMARX_GENERATE_DICTIONARY(typek,namek,Object*,ObjectPrx)

module armarx
{
    //generate range structures:
    //{Float, Double, Byte, Short, Int, Long}Range
    ARMARX_GENERATE_RANGE_STRUCT(float,Float);
    ARMARX_GENERATE_RANGE_STRUCT(double,Double);
    ARMARX_GENERATE_RANGE_STRUCT(byte,Byte);
    ARMARX_GENERATE_RANGE_STRUCT(short,Short);
    ARMARX_GENERATE_RANGE_STRUCT(int,Int);
    ARMARX_GENERATE_RANGE_STRUCT(long,Long);

    //generate dictionary types:
    //{Byte, Short, Int, Long, String}{Bool, Byte, Short, Int, Long, Float, Double, String}Dictionary
    ARMARX_GENERATE_DICTIONARY_FOR_ALL_VALUE_TYPES(byte,Byte);
    ARMARX_GENERATE_DICTIONARY_FOR_ALL_VALUE_TYPES(short,Short);
    ARMARX_GENERATE_DICTIONARY_FOR_ALL_VALUE_TYPES(int,Int);
    ARMARX_GENERATE_DICTIONARY_FOR_ALL_VALUE_TYPES(long,Long);
    ARMARX_GENERATE_DICTIONARY_FOR_ALL_VALUE_TYPES(string,String);
    ARMARX_GENERATE_DICTIONARY_FOR_ALL_VALUE_TYPES(Ice::Identity,Identity);

    //One dimensional lists (most are already defned by ice!)
    sequence<Object*> ObjectPrxSeq;

    //Two dimensional lists
    sequence<Ice::BoolSeq> BoolSeqSeq;
    sequence<Ice::ByteSeq> ByteSeqSeq;
    sequence<Ice::ShortSeq> ShortSeqSeq;
    sequence<Ice::IntSeq> IntSeqSeq;
    sequence<Ice::LongSeq> LongSeqSeq;
    sequence<Ice::FloatSeq> FloatSeqSeq;
    sequence<Ice::DoubleSeq> DoubleSeqSeq;
    sequence<Ice::StringSeq> StringSeqSeq;
    sequence<Ice::ObjectSeq> ObjectSeqSeq;
    sequence<ObjectPrxSeq> ObjectPrxSeqSeq;

    /**
     * @brief Wraps a proxy into an object.
     * Can be used to return a proxy, when the return type is Object
     */
    class ProxyWrapper
    {
            Object* proxy;
    };
};

#undef ARMARX_GENERATE_RANGE_STRUCT
#undef ARMARX_GENERATE_DICTIONARY
#undef ARMARX_GENERATE_DICTIONARY_FOR_ALL_VALUE_TYPES

