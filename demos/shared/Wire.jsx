// The hidden state behind an example: one column per party (a machine, a broker and a dashboard;
// the data, d3 and React) and what each one currently holds. Each fact is
// [name, value, className?, widest?]: `widest` is the longest value the fact can take, laid
// invisibly under the live one so that playing with the figure never changes its height.
export function Wire({ nodes }) {
  return (
    <div className="wire">
      {nodes.map(({ name, facts }) => (
        <section key={name}>
          <h3>{name}</h3>
          <dl>
            {facts.map(([k, v, cls, widest]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>
                  <span className={cls || undefined}>{v}</span>
                  {widest && (
                    <span className="ghost" aria-hidden="true">
                      {widest}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
