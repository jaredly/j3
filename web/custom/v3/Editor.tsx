import React from 'react';

export const Editor = () => {
    return (
        <div>
            {/* {cards.map((id) => (
                <Card />
            ))} */}
        </div>
    );
};

export const Card = ({ ns }: { ns: string; top: boolean }) => {
    // so what if the ns is about a thing, but it also wants documentation?
    // it could have like a `.doc` ns item, maybe? idk

    // changes should be segregated by "Toplevel"
    return <div></div>;
};
